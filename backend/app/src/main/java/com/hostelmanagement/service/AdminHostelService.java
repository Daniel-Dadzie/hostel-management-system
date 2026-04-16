package com.hostelmanagement.service;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hostelmanagement.domain.Hostel;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.web.admin.dto.UpsertHostelRequest;
import com.hostelmanagement.web.dto.HostelResponse;
import com.hostelmanagement.web.dto.PageResponse;

@Service
public class AdminHostelService {

  private final HostelRepository hostelRepository;

  public AdminHostelService(HostelRepository hostelRepository) {
    this.hostelRepository = hostelRepository;
  }

  @Transactional(readOnly = true)
  public List<HostelResponse> list(Boolean active) {
    List<Hostel> hostels;
    if (active == null) {
      hostels = hostelRepository.findAll();
    } else if (active) {
      hostels = hostelRepository.findByActiveTrue();
    } else {
      hostels = hostelRepository.findAll().stream().filter(h -> !h.isActive()).toList();
    }

    return hostels.stream().map(AdminHostelService::toDto).toList();
  }

  @Transactional(readOnly = true)
  public PageResponse<HostelResponse> listPaginated(Boolean active, Pageable pageable) {
    Page<Hostel> hostelPage;
    if (active == null) {
      hostelPage = hostelRepository.findAll(pageable);
    } else if (active) {
      hostelPage = hostelRepository.findByActiveTrue(pageable);
    } else {
      hostelPage = hostelRepository.findByActiveFalse(pageable);
    }

    Page<HostelResponse> responsePage = hostelPage.map(AdminHostelService::toDto);
    return PageResponse.from(responsePage);
  }

  @CacheEvict(value = "active-hostels", allEntries = true)
  @Transactional
  public HostelResponse create(UpsertHostelRequest request) {
    Hostel h = new Hostel();
    h.setName(request.name());
    h.setLocation(request.location());
    h.setImagePath(request.imagePath());
    h.setDistanceToCampusKm(request.distanceToCampusKm());
    h.setActive(request.active());
    h.setTotalRooms(0);

    return toDto(hostelRepository.save(h));
  }

  @CacheEvict(value = "active-hostels", allEntries = true)
  @Transactional
  public HostelResponse update(Long id, UpsertHostelRequest request) {
    Hostel h = hostelRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Hostel not found"));
    h.setName(request.name());
    h.setLocation(request.location());
    h.setImagePath(request.imagePath());
    h.setDistanceToCampusKm(request.distanceToCampusKm());
    h.setActive(request.active());
    return toDto(hostelRepository.save(h));
  }

  @Caching(evict = {
      @CacheEvict(value = "active-hostels", allEntries = true),
      @CacheEvict(value = "available-rooms", allEntries = true)
  })
  @Transactional
  public void deactivate(Long id) {
    Hostel h = hostelRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Hostel not found"));
    h.setActive(false);
    hostelRepository.save(h);
  }

  private static HostelResponse toDto(Hostel h) {
    return new HostelResponse(
        h.getId(),
        h.getName(),
        h.getLocation(),
        h.getImagePath(),
        h.getDistanceToCampusKm(),
        h.getTotalRooms(),
        h.isActive());
  }
}
