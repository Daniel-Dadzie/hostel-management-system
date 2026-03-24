package com.hostelmanagement.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
    name = "academic_terms",
    indexes = {
      @Index(name = "idx_academic_terms_active", columnList = "is_active"),
      @Index(name = "idx_academic_terms_date_window", columnList = "start_date,end_date")
    })
public class AcademicTerm {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "academic_year", nullable = false, length = 20)
  private String academicYear;

  @Column(name = "semester", nullable = false, length = 20)
  private String semester;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @Column(name = "reapplication_open_date", nullable = false)
  private LocalDate reapplicationOpenDate;

  @Column(name = "is_active", nullable = false)
  private boolean active = false;

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

  public String getAcademicYear() {
    return academicYear;
  }

  public void setAcademicYear(String academicYear) {
    this.academicYear = academicYear;
  }

  public String getSemester() {
    return semester;
  }

  public void setSemester(String semester) {
    this.semester = semester;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public LocalDate getEndDate() {
    return endDate;
  }

  public void setEndDate(LocalDate endDate) {
    this.endDate = endDate;
  }

  public LocalDate getReapplicationOpenDate() {
    return reapplicationOpenDate;
  }

  public void setReapplicationOpenDate(LocalDate reapplicationOpenDate) {
    this.reapplicationOpenDate = reapplicationOpenDate;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }
}
