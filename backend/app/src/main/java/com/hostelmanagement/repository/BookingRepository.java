package com.hostelmanagement.repository;

import com.hostelmanagement.domain.Booking;
import com.hostelmanagement.domain.BookingStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

  List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, Instant cutoff);

  Optional<Booking> findFirstByStudentIdAndStatusInOrderByIdDesc(Long studentId, List<BookingStatus> statuses);

  List<Booking> findByStatus(BookingStatus status);

    @Query(
      "SELECT b FROM Booking b "
        + "JOIN FETCH b.student s "
        + "LEFT JOIN FETCH b.room r "
        + "LEFT JOIN FETCH r.hostel h")
    List<Booking> findAllWithDetails();

    @Query(
      "SELECT b FROM Booking b "
        + "JOIN FETCH b.student s "
        + "LEFT JOIN FETCH b.room r "
        + "LEFT JOIN FETCH r.hostel h "
        + "WHERE b.status = :status")
    List<Booking> findByStatusWithDetails(@Param("status") BookingStatus status);

    @Query(
      "SELECT b FROM Booking b "
        + "JOIN FETCH b.student s "
        + "LEFT JOIN FETCH b.room r "
        + "LEFT JOIN FETCH r.hostel h "
        + "WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);
}
