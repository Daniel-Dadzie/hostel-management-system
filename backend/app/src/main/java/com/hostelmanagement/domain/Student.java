package com.hostelmanagement.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "students",
    uniqueConstraints = {
      @UniqueConstraint(name = "unique_student_email", columnNames = {"email"})
    },
    indexes = {
      @Index(name = "idx_students_reset_token", columnList = "reset_token"),
      @Index(name = "idx_students_email", columnList = "email")
    })
public class Student {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "full_name", nullable = false, length = 120)
  private String fullName;

  @Column(nullable = false, length = 200)
  private String email;

  @Column(length = 30)
  private String phone;

  @Column(name = "profile_image_path", columnDefinition = "MEDIUMTEXT")
  private String profileImagePath;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private Gender gender;

  @Column(nullable = false, length = 200)
  private String password;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private Role role = Role.STUDENT;

  @Column(name = "current_level", nullable = false)
  private int currentLevel = 100;

  @Column(name = "retained_from_checkout", nullable = false)
  private boolean retainedFromCheckout = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  // Password reset fields
  @Column(name = "reset_token")
  private String resetToken;

  @Column(name = "reset_token_expiry")
  private Instant resetTokenExpiry;

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

  public String getFullName() {
    return fullName;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getProfileImagePath() {
    return profileImagePath;
  }

  public void setProfileImagePath(String profileImagePath) {
    this.profileImagePath = profileImagePath;
  }

  public Gender getGender() {
    return gender;
  }

  public void setGender(Gender gender) {
    this.gender = gender;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Role getRole() {
    return role;
  }

  public void setRole(Role role) {
    this.role = role;
  }

  public int getCurrentLevel() {
    return currentLevel;
  }

  public void setCurrentLevel(int currentLevel) {
    this.currentLevel = currentLevel;
  }

  public boolean isRetainedFromCheckout() {
    return retainedFromCheckout;
  }

  public void setRetainedFromCheckout(boolean retainedFromCheckout) {
    this.retainedFromCheckout = retainedFromCheckout;
  }

  // Password reset getters and setters
  public String getResetToken() {
    return resetToken;
  }

  public void setResetToken(String resetToken) {
    this.resetToken = resetToken;
  }

  public Instant getResetTokenExpiry() {
    return resetTokenExpiry;
  }

  public void setResetTokenExpiry(Instant resetTokenExpiry) {
    this.resetTokenExpiry = resetTokenExpiry;
  }
}
