package com.hostelmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hostelmanagement.domain.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  Optional<Payment> findByBookingId(Long bookingId);
  Optional<Payment> findByTransactionReference(String transactionReference);

  List<Payment> findByBookingIdIn(List<Long> bookingIds);

  @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId ORDER BY p.createdAt DESC")
  List<Payment> findPaymentsByStudentId(@Param("studentId") Long studentId);
}
