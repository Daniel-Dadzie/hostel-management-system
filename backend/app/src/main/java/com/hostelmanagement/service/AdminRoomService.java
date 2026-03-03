package com.hostelmanagement.service;

import java.util.List;
import java.util.Objects;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.Hostel;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.web.admin.dto.UpsertRoomRequest;
import com.hostelmanagement.web.dto.RoomResponse;

@Service
public class AdminRoomService {

  private final RoomRepository roomRepository;
  private final HostelRepository hostelRepository;

  public AdminRoomService(RoomRepository roomRepository, HostelRepository hostelRepository) {
    this.roomRepository = roomRepository;
    this.hostelRepository = hostelRepository;
  }

  @Transactional(readOnly = true)
  public List<RoomResponse> list(Long hostelId) {
    List<Room> rooms =
        hostelId == null ? roomRepository.findAllWithHostel() : roomRepository.findByHostelIdWithHostel(hostelId);
    return rooms.stream().map(AdminRoomService::toDto).toList();
  }

  @CacheEvict(value = "available-rooms", allEntries = true)
  @Transactional
  public RoomResponse create(UpsertRoomRequest request) {
    Long requiredHostelId = Objects.requireNonNull(request.hostelId(), "hostelId is required");

    Hostel hostel =
        hostelRepository
        .findById(requiredHostelId)
            .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));

    validateFloorGenderConsistency(hostel.getId(), request.floorNumber(), request.roomGender(), null);

    Room r = new Room();
    r.setHostel(hostel);
    r.setRoomNumber(request.roomNumber());
    r.setCapacity(request.capacity());
    r.setRoomGender(request.roomGender());
    r.setMattressType(request.mattressType());
    r.setHasAc(request.hasAc());
    r.setHasWifi(request.hasWifi());
    r.setPrice(request.price());
    r.setFloorNumber(request.floorNumber());
    r.recalculateStatus();

    Room saved = roomRepository.save(r);

    hostel.setTotalRooms(hostel.getTotalRooms() + 1);
    hostelRepository.save(hostel);

    return toDto(saved);
  }

  @CacheEvict(value = "available-rooms", allEntries = true)
  @Transactional
  public RoomResponse update(Long id, UpsertRoomRequest request) {
    Room r = roomRepository.findByIdWithHostel(id).orElseThrow(() -> new IllegalArgumentException("Room not found"));

    if (request.capacity() < r.getCurrentOccupancy()) {
      throw new IllegalArgumentException("Capacity cannot be less than current occupancy");
    }

    Long requiredHostelId = Objects.requireNonNull(request.hostelId(), "hostelId is required");

    Hostel currentHostel = r.getHostel();
    Long targetHostelId = requiredHostelId;
    int targetFloorNumber = request.floorNumber();

    if (!currentHostel.getId().equals(requiredHostelId)) {
      Hostel newHostel =
          hostelRepository
          .findById(requiredHostelId)
              .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));
      r.setHostel(newHostel);
      targetHostelId = newHostel.getId();

      currentHostel.setTotalRooms(Math.max(0, currentHostel.getTotalRooms() - 1));
      hostelRepository.save(currentHostel);

      newHostel.setTotalRooms(newHostel.getTotalRooms() + 1);
      hostelRepository.save(newHostel);
    }

    validateFloorGenderConsistency(targetHostelId, targetFloorNumber, request.roomGender(), r.getId());

    r.setRoomNumber(request.roomNumber());
    r.setCapacity(request.capacity());
    r.setRoomGender(request.roomGender());
    r.setMattressType(request.mattressType());
    r.setHasAc(request.hasAc());
    r.setHasWifi(request.hasWifi());
    r.setPrice(request.price());
    r.setFloorNumber(request.floorNumber());
    r.recalculateStatus();

    return toDto(roomRepository.save(r));
  }

  @CacheEvict(value = "available-rooms", allEntries = true)
  @Transactional
  public void delete(Long id) {
    Room r = roomRepository.findByIdWithHostel(id).orElseThrow(() -> new IllegalArgumentException("Room not found"));
    if (r.getCurrentOccupancy() > 0) {
      throw new IllegalArgumentException("Cannot delete a room with occupants");
    }

    Hostel hostel = r.getHostel();

    roomRepository.delete(r);

    hostel.setTotalRooms(Math.max(0, hostel.getTotalRooms() - 1));
    hostelRepository.save(hostel);
  }

  private static RoomResponse toDto(Room r) {
    Hostel h = r.getHostel();
    return new RoomResponse(
        r.getId(),
        h == null ? null : h.getId(),
        h == null ? null : h.getName(),
        r.getRoomNumber(),
        r.getCapacity(),
        r.getCurrentOccupancy(),
        r.getRoomGender(),
        r.getMattressType(),
        r.isHasAc(),
        r.isHasWifi(),
        r.getStatus(),
        r.getPrice(),
        r.getFloorNumber());
  }

  private void validateFloorGenderConsistency(Long hostelId, int floorNumber, Gender roomGender, Long excludeRoomId) {
    List<Room> sameFloorRooms = roomRepository.findByHostelIdAndFloorNumber(hostelId, floorNumber);

    for (Room existingRoom : sameFloorRooms) {
      if (excludeRoomId != null && excludeRoomId.equals(existingRoom.getId())) {
        continue;
      }

      if (existingRoom.getRoomGender() != roomGender) {
        throw new IllegalArgumentException(
            "A floor must contain only one gender. Floor " + floorNumber + " is already assigned to "
                + existingRoom.getRoomGender());
      }
    }
  }
}
