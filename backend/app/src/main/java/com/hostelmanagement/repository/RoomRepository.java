package com.hostelmanagement.repository;

import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.domain.RoomStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface RoomRepository extends JpaRepository<Room, Long> {

  List<Room> findByHostelId(Long hostelId);

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

  @Query("SELECT r FROM Room r JOIN FETCH r.hostel h WHERE r.id = :id")
  Optional<Room> findByIdWithHostel(@Param("id") Long id);
}
