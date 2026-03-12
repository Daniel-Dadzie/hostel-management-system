package com.hostelmanagement.repository;

import com.hostelmanagement.domain.Student;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, Long> {
  Optional<Student> findByEmail(String email);
  Optional<Student> findByResetToken(String resetToken);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      UPDATE Student s
      SET s.resetToken = null,
          s.resetTokenExpiry = null
      WHERE s.resetToken IS NOT NULL
        AND s.resetTokenExpiry IS NOT NULL
        AND s.resetTokenExpiry < :cutoff
      """)
  int clearExpiredResetTokens(@Param("cutoff") Instant cutoff);
}
