package com.hostelmanagement.repository;

import com.hostelmanagement.domain.AcademicTerm;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicTermRepository extends JpaRepository<AcademicTerm, Long> {

  Optional<AcademicTerm> findFirstByActiveTrueOrderByStartDateDesc();

  Optional<AcademicTerm> findFirstByStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateDesc(
      LocalDate dateWithinStart, LocalDate dateWithinEnd);

  Optional<AcademicTerm> findFirstByStartDateLessThanEqualOrderByStartDateDesc(LocalDate date);

  List<AcademicTerm> findAllByOrderByStartDateDesc();
}
