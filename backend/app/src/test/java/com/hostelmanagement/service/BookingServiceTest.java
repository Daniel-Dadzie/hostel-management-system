package com.hostelmanagement.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hostelmanagement.domain.AcademicTerm;
import com.hostelmanagement.domain.Booking;
import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.Hostel;
import com.hostelmanagement.domain.MattressType;
import com.hostelmanagement.domain.Payment;
import com.hostelmanagement.domain.PaymentStatus;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.web.dto.ApplyRequest;
import com.hostelmanagement.web.dto.BookingResponse;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

  @Mock private HostelRepository hostelRepository;
  @Mock private RoomRepository roomRepository;
  @Mock private StudentRepository studentRepository;
  @Mock private BookingRepository bookingRepository;
  @Mock private PaymentRepository paymentRepository;
  @Mock private AcademicRolloverService academicRolloverService;
  @Mock private NotificationService notificationService;

  private BookingService bookingService;

  private static final long STUDENT_ID = 1L;
  private static final long HOSTEL_ID = 10L;
  private static final long ROOM_ID = 100L;
  private static final int FLOOR = 1;

  @BeforeEach
  void setUp() {
    bookingService = new BookingService(
        hostelRepository,
        roomRepository,
        studentRepository,
        bookingRepository,
        paymentRepository,
        academicRolloverService,
        notificationService,
        60L);
  }

  // ─── apply() ────────────────────────────────────────────────────────────

  @Test
  void apply_shouldThrowWhenStudentNotFound() {
    when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.empty());

    ApplyRequest request = new ApplyRequest(HOSTEL_ID, FLOOR, ROOM_ID, false, true, MattressType.NORMAL, null);

    assertThatThrownBy(() -> bookingService.apply(STUDENT_ID, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Student not found");
  }

  @Test
  void apply_shouldThrowWhenReapplicationWindowClosed() {
    Student student = makeStudent(STUDENT_ID, Gender.MALE);
    when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
    when(academicRolloverService.isReapplicationWindowOpen()).thenReturn(false);

    ApplyRequest request = new ApplyRequest(HOSTEL_ID, FLOOR, ROOM_ID, false, true, MattressType.NORMAL, null);

    assertThatThrownBy(() -> bookingService.apply(STUDENT_ID, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("The portal for next semester is not yet open");
  }

  @Test
  void apply_shouldThrowWhenStudentAlreadyHasApprovedBooking() {
    Student student = makeStudent(STUDENT_ID, Gender.MALE);
    when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
    when(academicRolloverService.isReapplicationWindowOpen()).thenReturn(true);

    Booking existing = new Booking();
    existing.setStatus(BookingStatus.APPROVED);
    when(bookingRepository.findFirstByStudentIdAndStatusInOrderByIdDesc(
        eq(STUDENT_ID), any()))
        .thenReturn(Optional.of(existing));

    ApplyRequest request = new ApplyRequest(HOSTEL_ID, FLOOR, ROOM_ID, false, true, MattressType.NORMAL, null);

    assertThatThrownBy(() -> bookingService.apply(STUDENT_ID, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("already have an allocated room");
  }

  @Test
  void apply_shouldThrowWhenStudentAlreadyHasPendingBooking() {
    Student student = makeStudent(STUDENT_ID, Gender.MALE);
    when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
    when(academicRolloverService.isReapplicationWindowOpen()).thenReturn(true);

    Booking existing = new Booking();
    existing.setStatus(BookingStatus.PENDING_PAYMENT);
    when(bookingRepository.findFirstByStudentIdAndStatusInOrderByIdDesc(
        eq(STUDENT_ID), any()))
        .thenReturn(Optional.of(existing));

    ApplyRequest request = new ApplyRequest(HOSTEL_ID, FLOOR, ROOM_ID, false, true, MattressType.NORMAL, null);

    assertThatThrownBy(() -> bookingService.apply(STUDENT_ID, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("already have an active hostel application");
  }

  @Test
  void apply_shouldThrowWhenHostelNotActive() {
    Student student = makeStudent(STUDENT_ID, Gender.MALE);
    when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
    when(academicRolloverService.isReapplicationWindowOpen()).thenReturn(true);
    when(bookingRepository.findFirstByStudentIdAndStatusInOrderByIdDesc(any(), any()))
        .thenReturn(Optional.empty());

    Hostel inactiveHostel = new Hostel();
    inactiveHostel.setActive(false);
    when(hostelRepository.findById(HOSTEL_ID)).thenReturn(Optional.of(inactiveHostel));

    ApplyRequest request = new ApplyRequest(HOSTEL_ID, FLOOR, ROOM_ID, false, true, MattressType.NORMAL, null);

    assertThatThrownBy(() -> bookingService.apply(STUDENT_ID, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("hostel is not available");
  }

  @Test
  void apply_shouldThrowWhenRoomGenderMismatch() {
    Student student = makeStudent(STUDENT_ID, Gender.FEMALE);
    Hostel hostel = makeHostel(HOSTEL_ID, true);
    Room room = makeRoom(ROOM_ID, hostel, FLOOR, Gender.MALE, MattressType.NORMAL, false, true);

    when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
    when(academicRolloverService.isReapplicationWindowOpen()).thenReturn(true);
    when(bookingRepository.findFirstByStudentIdAndStatusInOrderByIdDesc(any(), any()))
        .thenReturn(Optional.empty());
    when(hostelRepository.findById(HOSTEL_ID)).thenReturn(Optional.of(hostel));
    when(roomRepository.findByIdForUpdate(ROOM_ID)).thenReturn(room);

    ApplyRequest request = new ApplyRequest(HOSTEL_ID, FLOOR, ROOM_ID, false, true, MattressType.NORMAL, null);

    assertThatThrownBy(() -> bookingService.apply(STUDENT_ID, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("does not match student gender");
  }

  @Test
  void apply_shouldThrowWhenRoomIsFull() {
    Student student = makeStudent(STUDENT_ID, Gender.MALE);
    Hostel hostel = makeHostel(HOSTEL_ID, true);
    Room room = makeRoom(ROOM_ID, hostel, FLOOR, Gender.MALE, MattressType.NORMAL, false, true);
    room.setCapacity(1);
    room.incrementOccupancy();

    when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
    when(academicRolloverService.isReapplicationWindowOpen()).thenReturn(true);
    when(bookingRepository.findFirstByStudentIdAndStatusInOrderByIdDesc(any(), any()))
        .thenReturn(Optional.empty());
    when(hostelRepository.findById(HOSTEL_ID)).thenReturn(Optional.of(hostel));
    when(roomRepository.findByIdForUpdate(ROOM_ID)).thenReturn(room);

    ApplyRequest request = new ApplyRequest(HOSTEL_ID, FLOOR, ROOM_ID, false, true, MattressType.NORMAL, null);

    assertThatThrownBy(() -> bookingService.apply(STUDENT_ID, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("room is full or unavailable");
  }

  @Test
  void apply_shouldCreateBookingAndPaymentSuccessfully() {
    Student student = makeStudent(STUDENT_ID, Gender.MALE);
    Hostel hostel = makeHostel(HOSTEL_ID, true);
    Room room = makeRoom(ROOM_ID, hostel, FLOOR, Gender.MALE, MattressType.NORMAL, false, true);
    room.setPrice(new BigDecimal("500.00"));

    AcademicTerm term = new AcademicTerm();
    term.setAcademicYear("2025/2026");
    term.setSemester("REGULAR");

    when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
    when(academicRolloverService.isReapplicationWindowOpen()).thenReturn(true);
    when(bookingRepository.findFirstByStudentIdAndStatusInOrderByIdDesc(any(), any()))
        .thenReturn(Optional.empty());
    when(hostelRepository.findById(HOSTEL_ID)).thenReturn(Optional.of(hostel));
    when(roomRepository.findByIdForUpdate(ROOM_ID)).thenReturn(room);
    when(academicRolloverService.getRequiredActiveTerm()).thenReturn(term);
    when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
      Booking b = inv.getArgument(0);
      setId(b, 999L);
      return b;
    });
    when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

    ApplyRequest request = new ApplyRequest(HOSTEL_ID, FLOOR, ROOM_ID, false, true, MattressType.NORMAL, "Quiet room please");

    BookingResponse response = bookingService.apply(STUDENT_ID, request);

    assertThat(response).isNotNull();
    assertThat(response.status()).isEqualTo(BookingStatus.PENDING_PAYMENT);
    assertThat(response.hostelName()).isEqualTo("Test Hostel");
    assertThat(response.paymentAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
    verify(notificationService).sendBookingConfirmation(
        anyString(), anyString(), anyString(), anyString(), any(BigDecimal.class), any(Instant.class));
    verify(roomRepository).save(room);
  }

  // ─── updateStatus() ──────────────────────────────────────────────────────

  @Test
  void updateStatus_shouldThrowWhenBookingNotFound() {
    when(bookingRepository.findById(anyLong())).thenReturn(Optional.empty());

    assertThatThrownBy(() -> bookingService.updateStatus(1L, BookingStatus.APPROVED))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Booking not found");
  }

  @Test
  void updateStatus_shouldThrowForTerminalBooking() {
    Booking expired = new Booking();
    expired.setStatus(BookingStatus.EXPIRED);
    when(bookingRepository.findById(1L)).thenReturn(Optional.of(expired));

    assertThatThrownBy(() -> bookingService.updateStatus(1L, BookingStatus.APPROVED))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Booking is not updatable");
  }

  @Test
  void updateStatus_shouldApproveBookingAndMarkPaymentCompleted() {
    Student student = makeStudent(STUDENT_ID, Gender.MALE);
    Hostel hostel = makeHostel(HOSTEL_ID, true);
    Room room = makeRoom(ROOM_ID, hostel, FLOOR, Gender.MALE, MattressType.NORMAL, false, true);

    Booking booking = new Booking();
    setId(booking, 1L);
    booking.setStudent(student);
    booking.setRoom(room);
    booking.setStatus(BookingStatus.PENDING_PAYMENT);

    Payment payment = new Payment();
    payment.setStatus(PaymentStatus.PENDING);

    when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
    when(paymentRepository.findByBookingId(1L)).thenReturn(Optional.of(payment));
    when(bookingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    Booking result = bookingService.updateStatus(1L, BookingStatus.APPROVED);

    assertThat(result.getStatus()).isEqualTo(BookingStatus.APPROVED);
    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    verify(notificationService).sendPaymentApproval(anyString(), anyString(), anyString(), anyString());
  }

  @Test
  void updateStatus_shouldCancelBookingAndFreeRoom() {
    Hostel hostel = makeHostel(HOSTEL_ID, true);
    Room room = makeRoom(ROOM_ID, hostel, FLOOR, Gender.MALE, MattressType.NORMAL, false, true);
    room.incrementOccupancy();

    Booking booking = new Booking();
    setId(booking, 2L);
    booking.setRoom(room);
    booking.setStatus(BookingStatus.PENDING_PAYMENT);

    Payment payment = new Payment();
    payment.setStatus(PaymentStatus.PENDING);

    when(bookingRepository.findById(2L)).thenReturn(Optional.of(booking));
    when(roomRepository.findByIdForUpdate(ROOM_ID)).thenReturn(room);
    when(paymentRepository.findByBookingId(2L)).thenReturn(Optional.of(payment));
    when(bookingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(roomRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    bookingService.updateStatus(2L, BookingStatus.CANCELLED);

    assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.CANCELLED);
  }

  // ─── expirePendingPayments() ──────────────────────────────────────────────

  @Test
  void expirePendingPayments_shouldExpireAllPendingOlderThanCutoff() {
    Hostel hostel = makeHostel(HOSTEL_ID, true);
    Room room = makeRoom(ROOM_ID, hostel, FLOOR, Gender.MALE, MattressType.NORMAL, false, true);
    room.incrementOccupancy();

    Booking booking = new Booking();
    setId(booking, 5L);
    booking.setRoom(room);
    booking.setStatus(BookingStatus.PENDING_PAYMENT);

    Payment payment = new Payment();
    payment.setStatus(PaymentStatus.PENDING);

    Instant cutoff = Instant.now();
    when(bookingRepository.findByStatusAndCreatedAtBefore(BookingStatus.PENDING_PAYMENT, cutoff))
        .thenReturn(List.of(booking));
    when(roomRepository.findByIdForUpdate(ROOM_ID)).thenReturn(room);
    when(paymentRepository.findByBookingId(5L)).thenReturn(Optional.of(payment));
    when(bookingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(roomRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    int count = bookingService.expirePendingPayments(cutoff);

    assertThat(count).isEqualTo(1);
    assertThat(booking.getStatus()).isEqualTo(BookingStatus.EXPIRED);
    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.CANCELLED);
  }

  @Test
  void expirePendingPayments_shouldReturnZeroWhenNoExpiredBookings() {
    Instant cutoff = Instant.now();
    when(bookingRepository.findByStatusAndCreatedAtBefore(BookingStatus.PENDING_PAYMENT, cutoff))
        .thenReturn(List.of());

    int count = bookingService.expirePendingPayments(cutoff);

    assertThat(count).isEqualTo(0);
  }

  // ─── getLatestForStudent() ────────────────────────────────────────────────

  @Test
  void getLatestForStudent_shouldReturnBookingWithPaymentDetails() {
    Hostel hostel = makeHostel(HOSTEL_ID, true);
    Room room = makeRoom(ROOM_ID, hostel, FLOOR, Gender.MALE, MattressType.NORMAL, false, true);

    Booking booking = new Booking();
    setId(booking, 7L);
    booking.setStatus(BookingStatus.PENDING_PAYMENT);
    booking.setRoom(room);

    Payment payment = new Payment();
    payment.setStatus(PaymentStatus.PENDING);
    payment.setAmount(new BigDecimal("400.00"));
    payment.setDueAt(Instant.now().plusSeconds(3600));

    when(bookingRepository.findFirstByStudentIdAndStatusInOrderByIdDesc(eq(STUDENT_ID), any()))
        .thenReturn(Optional.of(booking));
    when(paymentRepository.findByBookingId(7L)).thenReturn(Optional.of(payment));

    BookingResponse response = bookingService.getLatestForStudent(STUDENT_ID);

    assertThat(response.id()).isEqualTo(7L);
    assertThat(response.status()).isEqualTo(BookingStatus.PENDING_PAYMENT);
    assertThat(response.hostelName()).isEqualTo("Test Hostel");
    assertThat(response.paymentAmount()).isEqualByComparingTo(new BigDecimal("400.00"));
  }

  @Test
  void getLatestForStudent_shouldThrowWhenNoBookingFound() {
    when(bookingRepository.findFirstByStudentIdAndStatusInOrderByIdDesc(eq(STUDENT_ID), any()))
        .thenReturn(Optional.empty());

    assertThatThrownBy(() -> bookingService.getLatestForStudent(STUDENT_ID))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("No booking found");
  }

  // ─── helpers ─────────────────────────────────────────────────────────────

  private static Student makeStudent(long id, Gender gender) {
    Student s = new Student();
    setId(s, id);
    s.setFullName("Test Student");
    s.setEmail("student@test.com");
    s.setGender(gender);
    return s;
  }

  private static Hostel makeHostel(long id, boolean active) {
    Hostel h = new Hostel();
    setId(h, id);
    h.setName("Test Hostel");
    h.setActive(active);
    return h;
  }

  private static Room makeRoom(
      long id, Hostel hostel, int floor, Gender gender,
      MattressType mattress, boolean hasAc, boolean hasWifi) {
    Room r = new Room();
    setId(r, id);
    r.setHostel(hostel);
    r.setRoomNumber("A101");
    r.setFloorNumber(floor);
    r.setRoomGender(gender);
    r.setMattressType(mattress);
    r.setHasAc(hasAc);
    r.setHasWifi(hasWifi);
    // Status defaults to AVAILABLE; fill capacity to simulate FULL if needed
    r.setCapacity(2);
    r.setPrice(new BigDecimal("500.00"));
    return r;
  }

  private static void setId(Object target, Long id) {
    try {
      Field field = target.getClass().getDeclaredField("id");
      field.setAccessible(true);
      field.set(target, id);
    } catch (ReflectiveOperationException ex) {
      throw new IllegalStateException("Unable to set id on " + target.getClass().getSimpleName(), ex);
    }
  }
}
