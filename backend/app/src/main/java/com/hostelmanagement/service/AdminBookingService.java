package com.hostelmanagement.service;

import com.hostelmanagement.domain.*;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.web.admin.dto.AdminBookingResponse;
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
        payment == null ? null : payment.getAmount(),
        payment == null ? null : payment.getDueAt());
  }
}
