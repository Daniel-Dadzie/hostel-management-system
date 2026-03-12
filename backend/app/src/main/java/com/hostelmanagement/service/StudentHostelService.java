package com.hostelmanagement.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hostelmanagement.domain.Hostel;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.web.dto.HostelResponse;
import com.hostelmanagement.web.dto.RoomResponse;

@Service
public class StudentHostelService {

  private final HostelRepository hostelRepository;
  private final RoomRepository roomRepository;
  private final StudentRepository studentRepository;

  public StudentHostelService(
      HostelRepository hostelRepository,
      RoomRepository roomRepository,
      StudentRepository studentRepository) {
    this.hostelRepository = hostelRepository;
    this.roomRepository = roomRepository;
    this.studentRepository = studentRepository;
  }

  @Cacheable("active-hostels")
  @Transactional(readOnly = true)
  public List<HostelResponse> listActiveHostels() {
    return hostelRepository.findByActiveTrue().stream()
        .sorted(
            Comparator.comparing(
                    Hostel::getDistanceToCampusKm,
                    Comparator.nullsLast(BigDecimal::compareTo))
                .thenComparing(Hostel::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
        .map(StudentHostelService::toHostelDto)
        .toList();
  }

  @Cacheable(value = "available-rooms", key = "#hostelId + '-' + #studentId")
  @Transactional(readOnly = true)
  public List<RoomResponse> listAvailableRooms(Long studentId, Long hostelId) {
    Long requiredStudentId = Objects.requireNonNull(studentId, "studentId is required");
    Objects.requireNonNull(hostelId, "hostelId is required");

    Student student =
        studentRepository
        .findById(requiredStudentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));

    return roomRepository.findAvailableByHostelIdAndGenderWithHostel(hostelId, student.getGender()).stream()
        .sorted(
            Comparator.comparingInt(Room::getFloorNumber)
                .thenComparing(Room::getPrice, Comparator.nullsLast(BigDecimal::compareTo))
                .thenComparing(Room::getRoomNumber, Comparator.nullsLast(String::compareToIgnoreCase)))
        .map(StudentHostelService::toRoomDto)
        .toList();
  }

  private static HostelResponse toHostelDto(Hostel hostel) {
    return new HostelResponse(
        hostel.getId(),
        hostel.getName(),
        hostel.getLocation(),
      hostel.getImagePath(),
        hostel.getDistanceToCampusKm(),
        hostel.getTotalRooms(),
        hostel.isActive());
  }

  private static RoomResponse toRoomDto(Room room) {
    Hostel hostel = room.getHostel();
    return new RoomResponse(
        room.getId(),
        hostel == null ? null : hostel.getId(),
        hostel == null ? null : hostel.getName(),
        room.getRoomNumber(),
        room.getCapacity(),
        room.getCurrentOccupancy(),
        room.getRoomGender(),
        room.getMattressType(),
        room.isHasAc(),
        room.isHasWifi(),
        room.getStatus(),
        room.getPrice(),
        room.getFloorNumber(),
        room.getRoomType());
  }
}
