package com.hostelmanagement.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
    name = "rooms",
    uniqueConstraints = {
      @UniqueConstraint(name = "unique_room", columnNames = {"hostel_id", "room_number"})
    },
    indexes = {
      @Index(name = "idx_rooms_hostel", columnList = "hostel_id"),
      @Index(name = "idx_rooms_status", columnList = "status"),
      @Index(name = "idx_rooms_gender", columnList = "room_gender")
    })
public class Room {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "hostel_id", nullable = false)
  private Hostel hostel;

  @Column(name = "room_number", nullable = false, length = 20)
  private String roomNumber;

  @Column(nullable = false)
  private int capacity = 2;

  @Column(name = "current_occupancy", nullable = false)
  private int currentOccupancy = 0;

  @Enumerated(EnumType.STRING)
  @Column(name = "room_gender", nullable = false, length = 10)
  private Gender roomGender;

  @Enumerated(EnumType.STRING)
  @Column(name = "mattress_type", nullable = false, length = 10)
  private MattressType mattressType = MattressType.NORMAL;

  @Column(name = "has_ac", nullable = false)
  private boolean hasAc = false;

  @Column(name = "has_wifi", nullable = false)
  private boolean hasWifi = true;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private RoomStatus status = RoomStatus.AVAILABLE;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal price = BigDecimal.ZERO;

  @Column(name = "floor_number", nullable = false)
  private int floorNumber = 1;

  @Version
  @Column(nullable = false)
  private long version;

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

  public Hostel getHostel() {
    return hostel;
  }

  public void setHostel(Hostel hostel) {
    this.hostel = hostel;
  }

  public String getRoomNumber() {
    return roomNumber;
  }

  public void setRoomNumber(String roomNumber) {
    this.roomNumber = roomNumber;
  }

  public int getCapacity() {
    return capacity;
  }

  public void setCapacity(int capacity) {
    this.capacity = capacity;
  }

  public int getCurrentOccupancy() {
    return currentOccupancy;
  }

  public Gender getRoomGender() {
    return roomGender;
  }

  public void setRoomGender(Gender roomGender) {
    this.roomGender = roomGender;
  }

  public MattressType getMattressType() {
    return mattressType;
  }

  public void setMattressType(MattressType mattressType) {
    this.mattressType = mattressType;
  }

  public boolean isHasAc() {
    return hasAc;
  }

  public void setHasAc(boolean hasAc) {
    this.hasAc = hasAc;
  }

  public boolean isHasWifi() {
    return hasWifi;
  }

  public void setHasWifi(boolean hasWifi) {
    this.hasWifi = hasWifi;
  }

  public RoomStatus getStatus() {
    return status;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal price) {
    this.price = price;
  }

  public int getFloorNumber() {
    return floorNumber;
  }

  public void setFloorNumber(int floorNumber) {
    this.floorNumber = floorNumber;
  }

  public void recalculateStatus() {
    if (currentOccupancy >= capacity) {
      status = RoomStatus.FULL;
    } else {
      status = RoomStatus.AVAILABLE;
    }
  }

  public void incrementOccupancy() {
    if (currentOccupancy >= capacity) {
      throw new IllegalStateException("Room is full");
    }
    currentOccupancy++;
    recalculateStatus();
  }

  public void decrementOccupancy() {
    if (currentOccupancy <= 0) {
      throw new IllegalStateException("Room occupancy already zero");
    }
    currentOccupancy--;
    recalculateStatus();
  }
}
