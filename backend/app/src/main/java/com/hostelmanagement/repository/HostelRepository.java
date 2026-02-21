package com.hostelmanagement.repository;

import com.hostelmanagement.domain.Hostel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HostelRepository extends JpaRepository<Hostel, Long> {
  List<Hostel> findByActiveTrue();
}
