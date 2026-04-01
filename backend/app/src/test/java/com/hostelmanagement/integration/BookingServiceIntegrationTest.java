package com.hostelmanagement.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.hostelmanagement.domain.AcademicTerm;
import com.hostelmanagement.domain.Booking;
import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.Hostel;
import com.hostelmanagement.domain.MattressType;
import com.hostelmanagement.domain.Payment;
import com.hostelmanagement.domain.PaymentStatus;
import com.hostelmanagement.domain.Role;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.AcademicTermRepository;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.service.BookingService;
import com.hostelmanagement.service.NotificationService;
import com.hostelmanagement.web.dto.ApplyRequest;
import com.hostelmanagement.web.dto.BookingResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BookingServiceIntegrationTest {

  @Autowired private BookingService bookingService;
  @Autowired private StudentRepository studentRepository;
  @Autowired private HostelRepository hostelRepository;
  @Autowired private RoomRepository roomRepository;
  @Autowired private BookingRepository bookingRepository;
  @Autowired private PaymentRepository paymentRepository;
  @Autowired private AcademicTermRepository academicTermRepository;
  @Autowired private PasswordEncoder passwordEncoder;

  @MockBean
  @SuppressWarnings("unused")
  private NotificationService notificationService;

  // ─── apply() ─────────────────────────────────────────────────────────────

  @Test
  void apply_shouldCreateBookingAndPendingPayment() {
    AcademicTerm term = createActiveTerm();
    Hostel hostel = createHostel();
    Room room = createRoom(hostel, Gender.MALE);
    Student student = createStudent(Gender.MALE);

    ApplyRequest request = new ApplyRequest(
        hostel.getId(), room.getFloorNumber(), room.getId(),
        false, true, MattressType.NORMAL, null);

    BookingResponse response = bookingService.apply(student.getId(), request);

    assertThat(response).isNotNull();
    assertThat(response.status()).isEqualTo(BookingStatus.PENDING_PAYMENT);
    assertThat(response.hostelName()).isEqualTo(hostel.getName());
    assertThat(response.roomNumber()).isEqualTo(room.getRoomNumber());
    assertThat(response.paymentStatus()).isEqualTo(PaymentStatus.PENDING);
    assertThat(response.paymentDueAt()).isAfter(Instant.now());

    Room updatedRoom = roomRepository.findById(room.getId()).orElseThrow();
    assertThat(updatedRoom.getCurrentOccupancy()).isEqualTo(1);

    assertThat(term).isNotNull();
  }

  @Test
  void apply_shouldPreventDuplicateActiveBooking() {
    createActiveTerm();
    Hostel hostel = createHostel();
    Room room1 = createRoom(hostel, Gender.MALE);
    Room room2 = createRoom(hostel, Gender.MALE);

    Student student = createStudent(Gender.MALE);

    ApplyRequest request1 = new ApplyRequest(
        hostel.getId(), room1.getFloorNumber(), room1.getId(),
        false, true, MattressType.NORMAL, null);
    bookingService.apply(student.getId(), request1);

    ApplyRequest request2 = new ApplyRequest(
        hostel.getId(), room2.getFloorNumber(), room2.getId(),
        false, true, MattressType.NORMAL, null);

    assertThatThrownBy(() -> bookingService.apply(student.getId(), request2))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("already have an active hostel application");
  }

  @Test
  void apply_shouldEnforceGenderMatchingForRoom() {
    createActiveTerm();
    Hostel hostel = createHostel();
    Room room = createRoom(hostel, Gender.FEMALE);
    Student maleStudent = createStudent(Gender.MALE);

    ApplyRequest request = new ApplyRequest(
        hostel.getId(), room.getFloorNumber(), room.getId(),
        false, true, MattressType.NORMAL, null);

    assertThatThrownBy(() -> bookingService.apply(maleStudent.getId(), request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("does not match student gender");
  }

  // ─── updateStatus() ──────────────────────────────────────────────────────

  @Test
  void updateStatus_shouldApproveAndMarkPaymentCompleted() {
    createActiveTerm();
    Hostel hostel = createHostel();
    Room room = createRoom(hostel, Gender.MALE);
    Student student = createStudent(Gender.MALE);

    ApplyRequest request = new ApplyRequest(
        hostel.getId(), room.getFloorNumber(), room.getId(),
        false, true, MattressType.NORMAL, null);
    BookingResponse applied = bookingService.apply(student.getId(), request);

    Booking booking = bookingService.updateStatus(applied.id(), BookingStatus.APPROVED);

    assertThat(booking.getStatus()).isEqualTo(BookingStatus.APPROVED);

    Payment payment = paymentRepository.findByBookingId(applied.id()).orElseThrow();
    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    assertThat(payment.getPaidAt()).isNotNull();
  }

  @Test
  void updateStatus_shouldCancelAndReleaseRoomOccupancy() {
    createActiveTerm();
    Hostel hostel = createHostel();
    Room room = createRoom(hostel, Gender.MALE);
    Student student = createStudent(Gender.MALE);

    ApplyRequest request = new ApplyRequest(
        hostel.getId(), room.getFloorNumber(), room.getId(),
        false, true, MattressType.NORMAL, null);
    BookingResponse applied = bookingService.apply(student.getId(), request);

    Room afterApply = roomRepository.findById(room.getId()).orElseThrow();
    assertThat(afterApply.getCurrentOccupancy()).isEqualTo(1);

    bookingService.updateStatus(applied.id(), BookingStatus.CANCELLED);

    Room afterCancel = roomRepository.findById(room.getId()).orElseThrow();
    assertThat(afterCancel.getCurrentOccupancy()).isEqualTo(0);

    Payment payment = paymentRepository.findByBookingId(applied.id()).orElseThrow();
    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.CANCELLED);
  }

  // ─── expirePendingPayments() ──────────────────────────────────────────────

  @Test
  void expirePendingPayments_shouldExpireOverdueBookingsAndFreeRooms() {
    createActiveTerm();
    Hostel hostel = createHostel();
    Room room = createRoom(hostel, Gender.MALE);
    Student student = createStudent(Gender.MALE);

    ApplyRequest request = new ApplyRequest(
        hostel.getId(), room.getFloorNumber(), room.getId(),
        false, true, MattressType.NORMAL, null);
    BookingResponse applied = bookingService.apply(student.getId(), request);

    Booking booking = bookingRepository.findById(applied.id()).orElseThrow();
    Instant pastCutoff = booking.getCreatedAt().plusSeconds(1);

    int expired = bookingService.expirePendingPayments(pastCutoff);

    assertThat(expired).isEqualTo(1);

    Booking expiredBooking = bookingRepository.findById(applied.id()).orElseThrow();
    assertThat(expiredBooking.getStatus()).isEqualTo(BookingStatus.EXPIRED);

    Room updatedRoom = roomRepository.findById(room.getId()).orElseThrow();
    assertThat(updatedRoom.getCurrentOccupancy()).isEqualTo(0);
  }

  // ─── getLatestForStudent() ────────────────────────────────────────────────

  @Test
  void getLatestForStudent_shouldReturnMostRecentBooking() {
    createActiveTerm();
    Hostel hostel = createHostel();
    Room room = createRoom(hostel, Gender.MALE);
    Student student = createStudent(Gender.MALE);

    ApplyRequest request = new ApplyRequest(
        hostel.getId(), room.getFloorNumber(), room.getId(),
        false, true, MattressType.NORMAL, "window seat please");
    bookingService.apply(student.getId(), request);

    BookingResponse result = bookingService.getLatestForStudent(student.getId());

    assertThat(result).isNotNull();
    assertThat(result.status()).isEqualTo(BookingStatus.PENDING_PAYMENT);
    assertThat(result.hostelName()).isEqualTo(hostel.getName());
    assertThat(result.paymentStatus()).isEqualTo(PaymentStatus.PENDING);
  }

  // ─── helpers ─────────────────────────────────────────────────────────────

  private AcademicTerm createActiveTerm() {
    AcademicTerm term = new AcademicTerm();
    term.setAcademicYear("2025/2026");
    term.setSemester("REGULAR");
    term.setStartDate(LocalDate.now().minusDays(30));
    term.setEndDate(LocalDate.now().plusDays(120));
    term.setReapplicationOpenDate(LocalDate.now().minusDays(10));
    term.setActive(true);
    return academicTermRepository.save(term);
  }

  private Hostel createHostel() {
    Hostel h = new Hostel();
    h.setName("Integration Hostel " + UUID.randomUUID().toString().substring(0, 6));
    h.setLocation("Test Campus");
    h.setTotalRooms(10);
    h.setActive(true);
    return hostelRepository.save(h);
  }

  private Room createRoom(Hostel hostel, Gender gender) {
    Room r = new Room();
    r.setHostel(hostel);
    r.setRoomNumber("A" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
    r.setFloorNumber(1);
    r.setCapacity(2);
    r.setRoomGender(gender);
    r.setMattressType(MattressType.NORMAL);
    r.setHasAc(false);
    r.setHasWifi(true);
    // status defaults to AVAILABLE
    r.setPrice(new BigDecimal("500.00"));
    return roomRepository.save(r);
  }

  private Student createStudent(Gender gender) {
    Student s = new Student();
    s.setFullName("Integration Test User");
    s.setEmail("student+" + UUID.randomUUID() + "@test.com");
    s.setPhone("0240000000");
    s.setGender(gender);
    s.setPassword(passwordEncoder.encode("Password123"));
    s.setRole(Role.STUDENT);
    return studentRepository.save(s);
  }
}
