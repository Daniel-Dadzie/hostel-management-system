package com.hostelmanagement.domain;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "hostels")
public class Hostel {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(length = 200)
  private String location;

  @Column(name = "image_url", columnDefinition = "MEDIUMTEXT")
  private String imageUrl;

  @Column(name = "distance_to_campus_km", precision = 6, scale = 2)
  private BigDecimal distanceToCampusKm;

  @Column(name = "total_rooms", nullable = false)
  private int totalRooms;

  @Column(nullable = false)
  private boolean active = true;

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

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
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
