package com.hostelmanagement.repository;

import com.hostelmanagement.domain.Payment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  Optional<Payment> findByBookingId(Long bookingId);

  List<Payment> findByBookingIdIn(List<Long> bookingIds);
}
