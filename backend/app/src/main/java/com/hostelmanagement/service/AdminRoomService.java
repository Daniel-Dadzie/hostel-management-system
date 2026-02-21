package com.hostelmanagement.service;

import com.hostelmanagement.domain.Hostel;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.web.admin.dto.UpsertRoomRequest;
import com.hostelmanagement.web.dto.RoomResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

  @Transactional
  public RoomResponse create(UpsertRoomRequest request) {
    Hostel hostel =
        hostelRepository
            .findById(request.hostelId())
            .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));

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

  @Transactional
  public RoomResponse update(Long id, UpsertRoomRequest request) {
    Room r = roomRepository.findByIdWithHostel(id).orElseThrow(() -> new IllegalArgumentException("Room not found"));

    if (request.capacity() < r.getCurrentOccupancy()) {
      throw new IllegalArgumentException("Capacity cannot be less than current occupancy");
    }

    Hostel currentHostel = r.getHostel();
    if (!currentHostel.getId().equals(request.hostelId())) {
      Hostel newHostel =
          hostelRepository
              .findById(request.hostelId())
              .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));
      r.setHostel(newHostel);

      currentHostel.setTotalRooms(Math.max(0, currentHostel.getTotalRooms() - 1));
      hostelRepository.save(currentHostel);

      newHostel.setTotalRooms(newHostel.getTotalRooms() + 1);
      hostelRepository.save(newHostel);
    }

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
}
