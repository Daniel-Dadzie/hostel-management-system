package com.hostelmanagement.domain;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(
    name = "hostels",
    indexes = {
      @Index(name = "idx_hostels_active", columnList = "active")
    })
@SuppressWarnings({"java:S1068", "java:S1144"})
public class Hostel {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(length = 200)
  private String location;

  @Column(name = "image_path", columnDefinition = "MEDIUMTEXT")
  private String imagePath;

  @Column(name = "distance_to_campus_km", precision = 6, scale = 2)
  private BigDecimal distanceToCampusKm;

  @Column(name = "total_rooms", nullable = false)
  private int totalRooms;

  @Column(nullable = false)
  private boolean active = true;

  @SuppressWarnings("unused") // Managed by JPA lifecycle callbacks.
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @SuppressWarnings("unused") // Managed by JPA lifecycle callbacks.
  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  @SuppressWarnings("unused") // Invoked reflectively by JPA.
  void onCreate() {
    Instant now = Instant.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  @SuppressWarnings("unused") // Invoked reflectively by JPA.
  void onUpdate() {
    this.updatedAt = Instant.now();
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getImagePath() {
    return imagePath;
  }

  public void setImagePath(String imagePath) {
    this.imagePath = imagePath;
  }

  public BigDecimal getDistanceToCampusKm() {
    return distanceToCampusKm;
  }

  public void setDistanceToCampusKm(BigDecimal distanceToCampusKm) {
    this.distanceToCampusKm = distanceToCampusKm;
  }

  public int getTotalRooms() {
    return totalRooms;
  }

  public void setTotalRooms(int totalRooms) {
    this.totalRooms = totalRooms;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }
}
