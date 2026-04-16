package com.hostelmanagement.service;

import com.hostelmanagement.domain.*;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.web.admin.dto.AdminBookingResponse;
import com.hostelmanagement.web.dto.PageResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBookingService {

  private final BookingRepository bookingRepository;
  private final PaymentRepository paymentRepository;
  private final BookingService bookingService;
  private final NotificationService notificationService;

  public AdminBookingService(
      BookingRepository bookingRepository,
      PaymentRepository paymentRepository,
      BookingService bookingService,
      NotificationService notificationService) {
    this.bookingRepository = bookingRepository;
    this.paymentRepository = paymentRepository;
    this.bookingService = bookingService;
    this.notificationService = notificationService;
  }

  @Transactional(readOnly = true)
  public List<AdminBookingResponse> list(BookingStatus status) {
    List<Booking> bookings =
        status == null ? bookingRepository.findAllWithDetails() : bookingRepository.findByStatusWithDetails(status);

    if (bookings.isEmpty()) {
      return List.of();
    }

    List<Long> bookingIds = bookings.stream().map(Booking::getId).toList();
    Map<Long, Payment> paymentByBookingId = new HashMap<>();
    for (Payment p : paymentRepository.findByBookingIdIn(bookingIds)) {
      paymentByBookingId.put(p.getBooking().getId(), p);
    }

    return bookings.stream().map(b -> toDto(b, paymentByBookingId.get(b.getId()))).toList();
  }

  @Transactional(readOnly = true)
  public PageResponse<AdminBookingResponse> listPaginated(BookingStatus status, Pageable pageable) {
    Page<Booking> bookingPage = 
        status == null ? bookingRepository.findAll(pageable) : bookingRepository.findByStatus(status, pageable);

    if (bookingPage.isEmpty()) {
      return PageResponse.from(new PageImpl<>(List.of(), pageable, 0));
    }

    List<Long> bookingIds = bookingPage.getContent().stream().map(Booking::getId).toList();
    Map<Long, Payment> paymentByBookingId = new HashMap<>();
    for (Payment p : paymentRepository.findByBookingIdIn(bookingIds)) {
      paymentByBookingId.put(p.getBooking().getId(), p);
    }

    List<AdminBookingResponse> content = 
        bookingPage.getContent().stream().map(b -> toDto(b, paymentByBookingId.get(b.getId()))).toList();
    
    Page<AdminBookingResponse> responsePage = 
        new PageImpl<>(content, pageable, bookingPage.getTotalElements());
    
    return PageResponse.from(responsePage);
  }

  @Transactional
  public AdminBookingResponse updateStatus(Long bookingId, BookingStatus status) {
    bookingService.updateStatus(bookingId, status);

    Booking booking =
        bookingRepository
            .findByIdWithDetails(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

    Payment payment = paymentRepository.findByBookingId(bookingId).orElse(null);
    
    // Send real-time WebSocket notifications when booking is approved
    Student student = booking.getStudent();
    if (student != null && status == BookingStatus.APPROVED) {
      // Send instant WebSocket notification to the student
      if (payment != null && payment.getStatus() == PaymentStatus.COMPLETED) {
        notificationService.notifyPaymentApprovedViaWebSocket(
            student.getId(), bookingId, payment.getId());
      } else {
        notificationService.notifyBookingApprovedViaWebSocket(student.getId(), bookingId);
      }
    } else if (student != null && status == BookingStatus.REJECTED) {
      // Send rejection notification
      notificationService.notifyBookingRejectedViaWebSocket(
          student.getId(), bookingId, "Your booking has been rejected by the administrator.");
    }
    
    return toDto(booking, payment);
  }

  @Transactional(readOnly = true)
  public ReceiptFile getReceiptFile(Long bookingId) {
    Payment payment =
        paymentRepository
            .findByBookingId(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

    if (payment.getReceiptStoragePath() == null || payment.getReceiptStoragePath().isBlank()) {
      throw new IllegalArgumentException("No receipt uploaded for this booking");
    }

    String filename =
        payment.getReceiptFilename() == null || payment.getReceiptFilename().isBlank()
            ? "receipt"
            : payment.getReceiptFilename();

    Path baseDir = Path.of("uploads/payment-receipts").toAbsolutePath().normalize();
    Path target = Path.of(payment.getReceiptStoragePath()).toAbsolutePath().normalize();

    if (!target.startsWith(baseDir)) {
      throw new IllegalArgumentException("Invalid receipt file location");
    }
    if (!Files.exists(target) || !Files.isRegularFile(target)) {
      throw new IllegalArgumentException("Receipt file not found on server");
    }

    return new ReceiptFile(target, payment.getReceiptContentType(), filename);
  }

  public record ReceiptFile(Path path, String contentType, String filename) {}

  private static AdminBookingResponse toDto(Booking booking, Payment payment) {
    Room room = booking.getRoom();
    Hostel hostel = room == null ? null : room.getHostel();
    Student student = booking.getStudent();

    return new AdminBookingResponse(
        booking.getId(),
        booking.getStatus(),
        booking.getCreatedAt(),
        booking.getSpecialRequests(),
        student == null ? null : student.getId(),
        student == null ? null : student.getFullName(),
        student == null ? null : student.getEmail(),
        hostel == null ? null : hostel.getName(),
        room == null ? null : room.getRoomNumber(),
        payment == null ? null : payment.getStatus(),
        payment == null ? null : payment.getPaymentMethod(),
        payment == null ? null : payment.getAmount(),
        payment == null ? null : payment.getDueAt(),
        payment == null ? null : payment.getTransactionReference(),
        payment == null ? null : payment.getReceiptFilename(),
        payment == null ? null : payment.getPaidAt());
  }
}
