package com.hostelmanagement.service;

import com.hostelmanagement.domain.*;
import com.hostelmanagement.repository.*;
import com.hostelmanagement.web.dto.ApplyRequest;
import com.hostelmanagement.web.dto.BookingResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

  private final HostelRepository hostelRepository;
  private final RoomRepository roomRepository;
  private final StudentRepository studentRepository;
  private final BookingRepository bookingRepository;
  private final PaymentRepository paymentRepository;

  private final long holdMinutes;

  public BookingService(
      HostelRepository hostelRepository,
      RoomRepository roomRepository,
      StudentRepository studentRepository,
      BookingRepository bookingRepository,
      PaymentRepository paymentRepository,
      @Value("${app.booking.payment-hold-minutes}") long holdMinutes) {
    this.hostelRepository = hostelRepository;
    this.roomRepository = roomRepository;
    this.studentRepository = studentRepository;
    this.bookingRepository = bookingRepository;
    this.paymentRepository = paymentRepository;
    this.holdMinutes = holdMinutes;
  }

  @Transactional
  public BookingResponse apply(Long studentId, ApplyRequest request) {
    Student student =
        studentRepository
            .findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));

    // Enforce one active booking at a time
    var active =
        bookingRepository.findFirstByStudentIdAndStatusInOrderByIdDesc(
            studentId,
            List.of(
                BookingStatus.PENDING_PAYMENT,
                BookingStatus.APPROVED));
    if (active.isPresent()) {
      throw new IllegalArgumentException("Student already has an active booking");
    }

    Room allocated = allocateRoom(student, request);
    if (allocated == null) {
      Booking rejected = new Booking();
      rejected.setStudent(student);
      rejected.setStatus(BookingStatus.REJECTED);
      rejected.setSpecialRequests(request.specialRequests());
      Booking saved = bookingRepository.save(rejected);
      return new BookingResponse(saved.getId(), saved.getStatus(), null, null, null);
    }

    // Lock & update occupancy safely
    Room locked = roomRepository.findByIdForUpdate(allocated.getId());
    locked.incrementOccupancy();
    roomRepository.save(locked);

    Booking booking = new Booking();
    booking.setStudent(student);
    booking.setRoom(locked);
    booking.setStatus(BookingStatus.PENDING_PAYMENT);
    booking.setSpecialRequests(request.specialRequests());
    Booking savedBooking = bookingRepository.save(booking);

    Instant dueAt = Instant.now().plus(holdMinutes, ChronoUnit.MINUTES);

    Payment payment = new Payment();
    payment.setStudent(student);
    payment.setBooking(savedBooking);
    payment.setStatus(PaymentStatus.PENDING);
    payment.setDueAt(dueAt);

    BigDecimal amount = locked.getPrice();
    payment.setAmount(amount == null ? BigDecimal.ZERO : amount);

    paymentRepository.save(payment);

    return new BookingResponse(
        savedBooking.getId(),
        savedBooking.getStatus(),
        locked.getHostel().getName(),
        locked.getRoomNumber(),
        dueAt);
  }

  @Transactional(readOnly = true)
  public BookingResponse getLatestForStudent(Long studentId) {
    Booking booking =
        bookingRepository
            .findFirstByStudentIdAndStatusInOrderByIdDesc(
                studentId,
                List.of(
                    BookingStatus.PENDING_PAYMENT,
                    BookingStatus.APPROVED,
                    BookingStatus.REJECTED,
                    BookingStatus.EXPIRED,
                    BookingStatus.CANCELLED))
            .orElseThrow(() -> new IllegalArgumentException("No booking found"));

    String hostelName = booking.getRoom() == null ? null : booking.getRoom().getHostel().getName();
    String roomNumber = booking.getRoom() == null ? null : booking.getRoom().getRoomNumber();

    Instant dueAt = paymentRepository.findByBookingId(booking.getId()).map(Payment::getDueAt).orElse(null);

    return new BookingResponse(booking.getId(), booking.getStatus(), hostelName, roomNumber, dueAt);
  }

  @Transactional
  public Booking updateStatus(Long bookingId, BookingStatus status) {
    Booking booking =
        bookingRepository
            .findById(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

    BookingStatus current = booking.getStatus();
    if (current == BookingStatus.EXPIRED || current == BookingStatus.CANCELLED || current == BookingStatus.REJECTED) {
      throw new IllegalArgumentException("Booking is not updatable");
    }

    if (!EnumSet.of(BookingStatus.APPROVED, BookingStatus.CANCELLED).contains(status)) {
      throw new IllegalArgumentException("Invalid status transition");
    }

    // If cancelling a pending booking, free the room
    if (status == BookingStatus.CANCELLED && current == BookingStatus.PENDING_PAYMENT) {
      Room room = booking.getRoom();
      if (room != null) {
        Room locked = roomRepository.findByIdForUpdate(room.getId());
        locked.decrementOccupancy();
        roomRepository.save(locked);
      }

      paymentRepository
          .findByBookingId(booking.getId())
          .ifPresent(
              p -> {
                p.setStatus(PaymentStatus.CANCELLED);
                paymentRepository.save(p);
              });
    }

    booking.setStatus(status);
    return bookingRepository.save(booking);
  }

  @Transactional
  public int expirePendingPayments(Instant cutoff) {
    List<Booking> expired = bookingRepository.findByStatusAndCreatedAtBefore(BookingStatus.PENDING_PAYMENT, cutoff);

    int updated = 0;
    for (Booking booking : expired) {
      // idempotency: re-check status
      if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) continue;

      Room room = booking.getRoom();
      if (room != null) {
        Room locked = roomRepository.findByIdForUpdate(room.getId());
        locked.decrementOccupancy();
        roomRepository.save(locked);
      }

      booking.setStatus(BookingStatus.EXPIRED);
      bookingRepository.save(booking);

      paymentRepository
          .findByBookingId(booking.getId())
          .ifPresent(
              p -> {
                p.setStatus(PaymentStatus.CANCELLED);
                paymentRepository.save(p);
              });

      updated++;
    }

    return updated;
  }

  private Room allocateRoom(Student student, ApplyRequest request) {
    // Students do NOT choose hostel; we scan all active hostels.
    // For MVP, we just pick the first matching available room.

    // If hostels empty, no room.
    if (hostelRepository.findByActiveTrue().isEmpty()) {
      return null;
    }

    List<Room> candidates =
        roomRepository.findMatchingRooms(
            RoomStatus.AVAILABLE,
            student.getGender(),
            request.hasAc(),
            request.hasWifi(),
            request.mattressType());

    if (candidates.isEmpty()) {
      return null;
    }

    // Simple selection: pick the room with the lowest occupancy ratio.
    Room best = null;
    double bestScore = Double.MAX_VALUE;
    for (Room r : candidates) {
      double score = (double) r.getCurrentOccupancy() / Math.max(1, r.getCapacity());
      if (score < bestScore) {
        bestScore = score;
        best = r;
      }
    }

    return best;
  }
}
