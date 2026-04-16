package com.hostelmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.domain.RoomStatus;

import jakarta.persistence.LockModeType;

public interface RoomRepository extends JpaRepository<Room, Long> {

  List<Room> findByHostelId(Long hostelId);
  Page<Room> findByHostelId(Long hostelId, Pageable pageable);

    List<Room> findByHostelIdAndFloorNumber(Long hostelId, int floorNumber);

  @Query(
      "SELECT r FROM Room r "
          + "WHERE r.status = :status "
          + "AND r.roomGender = :gender "
          + "AND r.hasAc = :hasAc "
          + "AND r.hasWifi = :hasWifi "
          + "AND r.mattressType = :mattressType")
  List<Room> findMatchingRooms(
      @Param("status") RoomStatus status,
      @Param("gender") Gender gender,
      @Param("hasAc") boolean hasAc,
      @Param("hasWifi") boolean hasWifi,
      @Param("mattressType") com.hostelmanagement.domain.MattressType mattressType);

  @Lock(LockModeType.OPTIMISTIC)
  @Query("SELECT r FROM Room r WHERE r.id = :id")
  Room findByIdForUpdate(@Param("id") Long id);

  @Query("SELECT r FROM Room r JOIN FETCH r.hostel h")
  List<Room> findAllWithHostel();

  @Query("SELECT r FROM Room r JOIN FETCH r.hostel h WHERE h.id = :hostelId")
  List<Room> findByHostelIdWithHostel(@Param("hostelId") Long hostelId);

  @Query(
      "SELECT r FROM Room r JOIN FETCH r.hostel h "
          + "WHERE h.id = :hostelId "
          + "AND h.active = true "
          + "AND r.status = com.hostelmanagement.domain.RoomStatus.AVAILABLE "
          + "AND r.currentOccupancy < r.capacity")
  List<Room> findAvailableByHostelIdWithHostel(@Param("hostelId") Long hostelId);

  @Query(
      "SELECT r FROM Room r JOIN FETCH r.hostel h "
          + "WHERE h.id = :hostelId "
          + "AND h.active = true "
          + "AND r.roomGender = :gender "
          + "AND r.status = com.hostelmanagement.domain.RoomStatus.AVAILABLE "
          + "AND r.currentOccupancy < r.capacity")
  List<Room> findAvailableByHostelIdAndGenderWithHostel(@Param("hostelId") Long hostelId, @Param("gender") Gender gender);

  @Query("SELECT r FROM Room r JOIN FETCH r.hostel h WHERE r.id = :id")
  Optional<Room> findByIdWithHostel(@Param("id") Long id);

  @Query("SELECT COUNT(r) FROM Room r WHERE r.status = :status")
long countByStatus(@Param("status") RoomStatus status);
}
