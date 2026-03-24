package com.hostelmanagement.service;

import com.hostelmanagement.domain.AcademicTerm;
import com.hostelmanagement.domain.Booking;
import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.domain.Role;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.AcademicTermRepository;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.repository.StudentRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AcademicRolloverService {

  private static final int MIN_LEVEL = 100;
  private static final int MAX_LEVEL = 400;
  private static final int LEVEL_STEP = 100;
  private static final ZoneId DEFAULT_ZONE = ZoneId.of("Africa/Lagos");
  private static final String STUDENT_NOT_FOUND = "Student not found";
  private static final String TERM_NOT_FOUND = "Academic term not found";

  private final BookingRepository bookingRepository;
  private final RoomRepository roomRepository;
  private final StudentRepository studentRepository;
  private final AcademicTermRepository academicTermRepository;
  private final ZoneId zoneId;

  public AcademicRolloverService(
      BookingRepository bookingRepository,
      RoomRepository roomRepository,
      StudentRepository studentRepository,
      AcademicTermRepository academicTermRepository) {
    this.bookingRepository = bookingRepository;
    this.roomRepository = roomRepository;
    this.studentRepository = studentRepository;
    this.academicTermRepository = academicTermRepository;
    this.zoneId = DEFAULT_ZONE;
  }

  public String getCurrentAcademicYear() {
    return getRequiredActiveTerm().getAcademicYear();
  }

  public String getCurrentAcademicSession() {
    return getRequiredActiveTerm().getSemester();
  }

  public AcademicTerm getRequiredActiveTerm() {
    return resolveActiveTerm()
        .orElseThrow(
            () ->
                new IllegalStateException(
                    "No active academic term configured. Please create or activate one."));
  }

  @Transactional(readOnly = true)
  public List<AcademicTerm> listAcademicTerms() {
    return academicTermRepository.findAllByOrderByStartDateDesc();
  }

  @Transactional
  public AcademicTerm createAcademicTerm(AcademicTermInput input) {
    validateAcademicTermInput(input);

    AcademicTerm term = new AcademicTerm();
    term.setAcademicYear(input.academicYear());
    term.setSemester(input.semester());
    term.setStartDate(input.startDate());
    term.setEndDate(input.endDate());
    term.setReapplicationOpenDate(input.reapplicationOpenDate());
    term.setActive(input.active());

    AcademicTerm saved = academicTermRepository.save(term);
    if (saved.isActive()) {
      setOnlyActiveTerm(saved.getId());
      return academicTermRepository.findById(saved.getId()).orElse(saved);
    }
    return saved;
  }

  @Transactional
  public AcademicTerm updateAcademicTerm(Long termId, AcademicTermInput input) {
    validateAcademicTermInput(input);

    AcademicTerm term =
        academicTermRepository
            .findById(termId)
            .orElseThrow(() -> new IllegalArgumentException(TERM_NOT_FOUND));

    term.setAcademicYear(input.academicYear());
    term.setSemester(input.semester());
    term.setStartDate(input.startDate());
    term.setEndDate(input.endDate());
    term.setReapplicationOpenDate(input.reapplicationOpenDate());
    term.setActive(input.active());

    AcademicTerm saved = academicTermRepository.save(term);
    if (saved.isActive()) {
      setOnlyActiveTerm(saved.getId());
      return academicTermRepository.findById(saved.getId()).orElse(saved);
    }
    return saved;
  }

  @Transactional
  public AcademicTerm activateAcademicTerm(Long termId) {
    AcademicTerm term =
        academicTermRepository
            .findById(termId)
            .orElseThrow(() -> new IllegalArgumentException(TERM_NOT_FOUND));

    setOnlyActiveTerm(termId);
    return term;
  }

  private void setOnlyActiveTerm(Long activeTermId) {
    List<AcademicTerm> terms = academicTermRepository.findAll();
    for (AcademicTerm existing : terms) {
      existing.setActive(existing.getId().equals(activeTermId));
    }
    academicTermRepository.saveAll(terms);
  }

  @Transactional
  public void deleteAcademicTerm(Long termId) {
    AcademicTerm term =
        academicTermRepository
            .findById(termId)
            .orElseThrow(() -> new IllegalArgumentException(TERM_NOT_FOUND));

    if (term.isActive()) {
      throw new IllegalArgumentException("Cannot delete an active academic term");
    }

    boolean termInUse = bookingRepository.existsByAcademicTermId(termId);
    if (termInUse) {
      throw new IllegalArgumentException("Cannot delete a term that has booking history");
    }

    academicTermRepository.delete(term);
  }

  public boolean isReapplicationWindowOpen() {
    AcademicTerm activeTerm = getRequiredActiveTerm();
    return !LocalDate.now(zoneId).isBefore(activeTerm.getReapplicationOpenDate());
  }

  @CacheEvict(value = "available-rooms", allEntries = true)
  @Transactional
  public RolloverRunSummary runAnnualRollover() {
    return checkoutTermBookings(getRequiredActiveTerm(), false);
  }

  @CacheEvict(value = "available-rooms", allEntries = true)
  @Transactional
  public RolloverRunSummary runTermEndCheckoutIfDue() {
    AcademicTerm activeTerm = resolveActiveTerm().orElse(null);
    if (activeTerm == null) {
      return new RolloverRunSummary(null, null, 0, false);
    }

    boolean due = LocalDate.now(zoneId).isAfter(activeTerm.getEndDate());
    if (!due) {
      return new RolloverRunSummary(
          activeTerm.getAcademicYear(), activeTerm.getSemester(), 0, false);
    }

    return checkoutTermBookings(activeTerm, true);
  }

  @CacheEvict(value = "available-rooms", allEntries = true)
  @Transactional
  public StudentActionResult checkoutStudent(Long studentId) {
    Student student =
        studentRepository
            .findById(studentId)
        .orElseThrow(() -> new IllegalArgumentException(STUDENT_NOT_FOUND));

    Booking approvedBooking =
        bookingRepository
            .findFirstByStudentIdAndStatusOrderByIdDesc(studentId, BookingStatus.APPROVED)
            .orElseThrow(() -> new IllegalArgumentException("Student has no approved booking to checkout"));

    student.setRetainedFromCheckout(false);
    studentRepository.save(student);
    checkoutBookingInternal(approvedBooking);
    return new StudentActionResult(
        student.getId(),
        student.getCurrentLevel(),
        student.isRetainedFromCheckout(),
        "CHECKOUT",
        approvedBooking.getId());
  }

  @Transactional
  public StudentActionResult promoteStudent(Long studentId) {
    Student student =
        studentRepository
            .findById(studentId)
        .orElseThrow(() -> new IllegalArgumentException(STUDENT_NOT_FOUND));

    int newLevel = clampLevel(student.getCurrentLevel() + LEVEL_STEP);
    student.setCurrentLevel(newLevel);
    studentRepository.save(student);

    return new StudentActionResult(
      student.getId(), newLevel, student.isRetainedFromCheckout(), "PROMOTE", null);
  }

  @Transactional
  public StudentActionResult retainStudent(Long studentId) {
    Student student =
        studentRepository
            .findById(studentId)
        .orElseThrow(() -> new IllegalArgumentException(STUDENT_NOT_FOUND));

    int currentLevel = clampLevel(student.getCurrentLevel());
    student.setCurrentLevel(currentLevel);
    student.setRetainedFromCheckout(true);
    studentRepository.save(student);

    return new StudentActionResult(
      student.getId(), currentLevel, student.isRetainedFromCheckout(), "RETAIN", null);
  }

  @Transactional
  public StudentActionResult clearRetainStudent(Long studentId) {
    Student student =
        studentRepository
            .findById(studentId)
        .orElseThrow(() -> new IllegalArgumentException(STUDENT_NOT_FOUND));

    student.setRetainedFromCheckout(false);
    studentRepository.save(student);
    return new StudentActionResult(
        student.getId(), student.getCurrentLevel(), student.isRetainedFromCheckout(), "CLEAR_RETAIN", null);
  }

  @Transactional
  public List<StudentActionResult> bulkPromoteStudents(List<Long> studentIds) {
    return studentIds.stream().distinct().map(this::promoteStudent).toList();
  }

  @Transactional
  public List<StudentActionResult> bulkRetainStudents(List<Long> studentIds) {
    return studentIds.stream().distinct().map(this::retainStudent).toList();
  }

  @Transactional
  public List<StudentActionResult> bulkClearRetainStudents(List<Long> studentIds) {
    return studentIds.stream().distinct().map(this::clearRetainStudent).toList();
  }

  @Transactional
  public List<StudentActionResult> bulkCheckoutStudents(List<Long> studentIds) {
    return studentIds.stream().distinct().map(this::checkoutStudent).toList();
  }

  @Transactional(readOnly = true)
  public List<StudentRolloverRow> listStudentRolloverContext() {
    return studentRepository.findByRole(Role.STUDENT).stream()
        .map(this::toStudentRolloverRow)
        .toList();
  }

  private StudentRolloverRow toStudentRolloverRow(Student student) {
    Booking activeBooking =
        bookingRepository
            .findFirstByStudentIdAndStatusOrderByIdDesc(student.getId(), BookingStatus.APPROVED)
            .orElse(null);

    String bookingAcademicYear = null;
    String bookingAcademicSession = null;
    if (activeBooking != null) {
      AcademicTerm term = activeBooking.getAcademicTerm();
      bookingAcademicYear = term == null ? activeBooking.getAcademicYear() : term.getAcademicYear();
      bookingAcademicSession = term == null ? activeBooking.getAcademicSession() : term.getSemester();
    }

    return new StudentRolloverRow(
        student.getId(),
        student.getFullName(),
        student.getEmail(),
        student.getCurrentLevel(),
        student.isRetainedFromCheckout(),
        activeBooking != null,
        activeBooking == null ? null : activeBooking.getId(),
        activeBooking == null || activeBooking.getRoom() == null
            ? null
            : activeBooking.getRoom().getHostel().getName(),
        activeBooking == null || activeBooking.getRoom() == null
            ? null
            : activeBooking.getRoom().getRoomNumber(),
        bookingAcademicYear,
        bookingAcademicSession);
  }

  private static int clampLevel(int level) {
    if (level < MIN_LEVEL) {
      return MIN_LEVEL;
    }
    if (level > MAX_LEVEL) {
      return MAX_LEVEL;
    }
    return level;
  }

  private static void validateAcademicTermInput(AcademicTermInput input) {
    if (input.startDate().isAfter(input.endDate())) {
      throw new IllegalArgumentException("Term start date cannot be after end date");
    }
    if (input.reapplicationOpenDate().isBefore(input.startDate())) {
      throw new IllegalArgumentException(
          "Reapplication open date cannot be before term start date");
    }
  }

  private java.util.Optional<AcademicTerm> resolveActiveTerm() {
    java.util.Optional<AcademicTerm> activeTerm =
        academicTermRepository.findFirstByActiveTrueOrderByStartDateDesc();
    if (activeTerm.isPresent()) {
      return activeTerm;
    }

    LocalDate today = LocalDate.now(zoneId);
    return academicTermRepository
        .findFirstByStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateDesc(today, today)
        .or(() -> academicTermRepository.findFirstByStartDateLessThanEqualOrderByStartDateDesc(today));
  }

  private RolloverRunSummary checkoutTermBookings(AcademicTerm term, boolean triggered) {
    List<Booking> approvedBookings =
        bookingRepository.findByStatusAndAcademicTermId(BookingStatus.APPROVED, term.getId());

    int checkedOutBookings = 0;
    for (Booking booking : approvedBookings) {
      Student student = booking.getStudent();
      if (student != null && student.isRetainedFromCheckout()) {
        continue;
      }
      checkedOutBookings += checkoutBookingInternal(booking) ? 1 : 0;
    }

    term.setActive(false);
    academicTermRepository.save(term);

    LocalDate today = LocalDate.now(zoneId);
    academicTermRepository
        .findFirstByStartDateLessThanEqualOrderByStartDateDesc(today)
        .filter(next -> !next.getId().equals(term.getId()))
        .ifPresent(
            next -> {
              next.setActive(true);
              academicTermRepository.save(next);
            });

    return new RolloverRunSummary(
        term.getAcademicYear(), term.getSemester(), checkedOutBookings, triggered);
  }

  private boolean checkoutBookingInternal(Booking booking) {
    if (booking == null || booking.getStatus() != BookingStatus.APPROVED) {
      return false;
    }

    Room room = booking.getRoom();
    if (room != null) {
      Room lockedRoom = roomRepository.findByIdForUpdate(room.getId());
      if (lockedRoom != null && lockedRoom.getCurrentOccupancy() > 0) {
        lockedRoom.decrementOccupancy();
        roomRepository.save(lockedRoom);
      }
    }

    booking.setRoom(null);
    booking.setStatus(BookingStatus.CHECKED_OUT);
    booking.setCheckedOutAt(Instant.now());
    bookingRepository.save(booking);
    return true;
  }

  public record RolloverRunSummary(
      String academicYear, String semester, int checkedOutBookings, boolean triggered) {}

  public record AcademicTermInput(
      String academicYear,
      String semester,
      LocalDate startDate,
      LocalDate endDate,
      LocalDate reapplicationOpenDate,
      boolean active) {}

  public record StudentActionResult(
      Long studentId,
      int currentLevel,
      boolean retainedFromCheckout,
      String action,
      Long affectedBookingId) {}

  public record StudentRolloverRow(
      Long studentId,
      String fullName,
      String email,
      int currentLevel,
      boolean retainedFromCheckout,
      boolean hasActiveBooking,
      Long activeBookingId,
      String hostelName,
      String roomNumber,
      String bookingAcademicYear,
      String bookingAcademicSession) {}
}
