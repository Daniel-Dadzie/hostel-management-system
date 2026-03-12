package com.hostelmanagement.service;

import com.hostelmanagement.domain.*;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.web.admin.dto.AdminBookingResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBookingService {

  private final BookingRepository bookingRepository;
  private final PaymentRepository paymentRepository;
  private final BookingService bookingService;

  public AdminBookingService(
      BookingRepository bookingRepository, PaymentRepository paymentRepository, BookingService bookingService) {
    this.bookingRepository = bookingRepository;
    this.paymentRepository = paymentRepository;
    this.bookingService = bookingService;
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

  @Transactional
  public AdminBookingResponse updateStatus(Long bookingId, BookingStatus status) {
    bookingService.updateStatus(bookingId, status);

    Booking booking =
        bookingRepository
            .findByIdWithDetails(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

    Payment payment = paymentRepository.findByBookingId(bookingId).orElse(null);
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
