package com.hostelmanagement.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hostelmanagement.domain.Role;
import com.hostelmanagement.domain.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
  Optional<Student> findByEmail(String email);
  Optional<Student> findByResetToken(String resetToken);
  Optional<Student> findByEmailVerificationToken(String emailVerificationToken);
  List<Student> findByRole(Role role);

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

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      UPDATE Student s
      SET s.emailVerificationToken = null,
          s.emailVerificationTokenExpiry = null
      WHERE s.emailVerificationToken IS NOT NULL
        AND s.emailVerificationTokenExpiry IS NOT NULL
        AND s.emailVerificationTokenExpiry < :cutoff
      """)
  int clearExpiredEmailVerificationTokens(@Param("cutoff") Instant cutoff);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      UPDATE Student s
      SET s.resetToken = null,
          s.resetTokenExpiry = null
      WHERE s.resetToken IS NULL
        AND s.resetTokenExpiry IS NULL
        AND s.lastPasswordResetAt IS NOT NULL
        AND s.lastPasswordResetAt < :cutoff
      """)
  int clearUsedResetTokensOlderthan(@Param("cutoff") Instant cutoff);
}
