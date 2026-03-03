package com.hostelmanagement.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hostelmanagement.domain.Booking;
import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.domain.Payment;
import com.hostelmanagement.domain.PaymentStatus;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.domain.RoomStatus;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.web.dto.ApplyRequest;
import com.hostelmanagement.web.dto.BookingResponse;

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

  @CacheEvict(value = "available-rooms", allEntries = true)
  @Transactional
  public BookingResponse apply(Long studentId, ApplyRequest request) {
    Long requiredStudentId = Objects.requireNonNull(studentId, "studentId is required");
    Long requiredHostelId = Objects.requireNonNull(request.hostelId(), "hostelId is required");
    Integer requiredFloorNumber = Objects.requireNonNull(request.floorNumber(), "floorNumber is required");
    Long requiredRoomId = Objects.requireNonNull(request.roomId(), "roomId is required");

    Student student =
        studentRepository
        .findById(requiredStudentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));

    // Enforce one active booking at a time
    var active =
        bookingRepository.findFirstByStudentIdAndStatusInOrderByIdDesc(
            requiredStudentId,
            List.of(
                BookingStatus.PENDING_PAYMENT,
                BookingStatus.APPROVED));
    if (active.isPresent()) {
      throw new IllegalArgumentException("Student already has an active booking");
    }

    var hostelOpt = hostelRepository.findById(requiredHostelId);
    if (hostelOpt.isEmpty() || !hostelOpt.get().isActive()) {
      throw new IllegalArgumentException("Selected hostel is not available");
    }

    // Lock selected room and validate the exact student choice
    Room locked = roomRepository.findByIdForUpdate(requiredRoomId);
    if (locked == null) {
      throw new IllegalArgumentException("Selected room not found");
    }

    if (locked.getHostel() == null || !locked.getHostel().getId().equals(requiredHostelId)) {
      throw new IllegalArgumentException("Selected room does not belong to selected hostel");
    }

    if (locked.getFloorNumber() != requiredFloorNumber) {
      throw new IllegalArgumentException("Selected room does not belong to selected floor");
    }

    if (!locked.getHostel().isActive()) {
      throw new IllegalArgumentException("Selected hostel is not active");
    }

    if (locked.getStatus() != RoomStatus.AVAILABLE || locked.getCurrentOccupancy() >= locked.getCapacity()) {
      throw new IllegalArgumentException("Selected room is full or unavailable");
    }

    if (locked.getRoomGender() != student.getGender()) {
      throw new IllegalArgumentException("Selected room does not match student gender");
    }

    if (locked.isHasAc() != request.hasAc()) {
      throw new IllegalArgumentException("Selected room does not match AC preference");
    }

    if (locked.isHasWifi() != request.hasWifi()) {
      throw new IllegalArgumentException("Selected room does not match WiFi preference");
    }

    if (locked.getMattressType() != request.mattressType()) {
      throw new IllegalArgumentException("Selected room does not match mattress preference");
    }

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

  @CacheEvict(value = "available-rooms", allEntries = true)
  @Transactional
  public Booking updateStatus(Long bookingId, BookingStatus status) {
    Long requiredBookingId = Objects.requireNonNull(bookingId, "bookingId is required");

    Booking booking =
        bookingRepository
        .findById(requiredBookingId)
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

  @CacheEvict(value = "available-rooms", allEntries = true)
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
}
