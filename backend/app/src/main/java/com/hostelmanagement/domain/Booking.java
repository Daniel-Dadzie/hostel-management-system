package com.hostelmanagement.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "bookings",
    indexes = {
      @Index(name = "idx_bookings_student", columnList = "student_id"),
      @Index(name = "idx_bookings_status", columnList = "status"),
      @Index(name = "idx_bookings_student_status", columnList = "student_id,status"),
      @Index(name = "idx_bookings_created_at", columnList = "created_at"),
      @Index(name = "idx_bookings_room", columnList = "room_id"),
      @Index(name = "idx_bookings_academic_term", columnList = "academic_term_id")
    })
public class Booking {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "student_id", nullable = false)
  private Student student;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "room_id")
  private Room room;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private BookingStatus status;

  @Column(name = "special_requests", length = 500)
  private String specialRequests;

  @Column(name = "academic_year", nullable = false, length = 20)
  private String academicYear;

  @Column(name = "academic_session", nullable = false, length = 20)
  private String academicSession = "REGULAR";

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "academic_term_id")
  private AcademicTerm academicTerm;

  @Column(name = "checked_out_at")
  private Instant checkedOutAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    Instant now = Instant.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    this.updatedAt = Instant.now();
  }

  public Long getId() {
    return id;
  }

  public Student getStudent() {
    return student;
  }

  public void setStudent(Student student) {
    this.student = student;
  }

  public Room getRoom() {
    return room;
  }

  public void setRoom(Room room) {
    this.room = room;
  }

  public BookingStatus getStatus() {
    return status;
  }

  public void setStatus(BookingStatus status) {
    this.status = status;
  }

  public String getSpecialRequests() {
    return specialRequests;
  }

  public void setSpecialRequests(String specialRequests) {
    this.specialRequests = specialRequests;
  }

  public String getAcademicYear() {
    return academicYear;
  }

  public void setAcademicYear(String academicYear) {
    this.academicYear = academicYear;
  }

  public String getAcademicSession() {
    return academicSession;
  }

  public void setAcademicSession(String academicSession) {
    this.academicSession = academicSession;
  }

  public AcademicTerm getAcademicTerm() {
    return academicTerm;
  }

  public void setAcademicTerm(AcademicTerm academicTerm) {
    this.academicTerm = academicTerm;
  }

  public Instant getCheckedOutAt() {
    return checkedOutAt;
  }

  public void setCheckedOutAt(Instant checkedOutAt) {
    this.checkedOutAt = checkedOutAt;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
