package com.hostelmanagement.service;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.Hostel;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.domain.RoomStatus;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.web.dto.RoomResponse;

/**
 * Service for warming (pre-loading) Redis caches to optimize peak load performance.
 *
 * <p>During peak booking season, cache misses cause database hits. This service pre-loads
 * frequently accessed data into cache to:
 * <ul>
 *   <li>Reduce cold start latency for students browsing rooms
 *   <li>Distribute cache loading over time instead of thundering herd on cache miss
 *   <li>Ensure up-to-date availability data at known times (e.g., hourly)
 * </ul>
 *
 * <p><b>Caching Strategy:</b>
 * <ul>
 *   <li>On application startup: Warm critical caches (active hostels)
 *   <li>During business hours (7 AM - 10 PM): Hourly refresh of available rooms
 *   <li>Targeted warming: Load only data that will likely be requested
 * </ul>
 *
 * <p><b>When to warm cache:</b>
 * <ul>
 *   <li>Application startup → warm hostels list (accessed first)
 *   <li>Peak hours (7 AM - 10 PM) → hourly warm available rooms per hostel
 *   <li>After bulk admin operations → manual warm via REST endpoint
 * </ul>
 */
@Service
public class CacheWarmingService {

  private static final Logger log = LoggerFactory.getLogger(CacheWarmingService.class);

  private final StudentHostelService studentHostelService;
  private final HostelRepository hostelRepository;
  private final RoomRepository roomRepository;
  private final StudentRepository studentRepository;

  public CacheWarmingService(
      StudentHostelService studentHostelService,
      HostelRepository hostelRepository,
      RoomRepository roomRepository,
      StudentRepository studentRepository) {
    this.studentHostelService = studentHostelService;
    this.hostelRepository = hostelRepository;
    this.roomRepository = roomRepository;
    this.studentRepository = studentRepository;
  }

  /**
   * Warms the active hostels cache on application startup.
   * Called automatically by Spring after application initialization.
   */
  @Transactional(readOnly = true)
  public void warmActiveHostelsOnStartup() {
    long startMs = System.currentTimeMillis();
    try {
      int count = studentHostelService.listActiveHostels().size();
      long duration = System.currentTimeMillis() - startMs;
      log.info(
          "[CACHE-WARMING] Warmed active-hostels cache with {} hostels in {}ms",
          count, duration);
    } catch (Exception e) {
      log.warn("[CACHE-WARMING] Failed to warm active-hostels cache: {}", e.getMessage());
    }
  }

  /**
   * Warms available rooms cache for each hostel/gender combination.
   * Scheduled during peak hours (7 AM - 10 PM) hourly.
   * This distributes cache warming over time instead of all happening on cache miss.
   *
   * <p>Execution: Runs every hour during peak hours.
   * If peak hours don't overlap this execution, it skips gracefully.
   */
  @Scheduled(cron = "0 0 7-22 * * *") // Every hour, 7 AM to 10 PM, every day
  @Transactional(readOnly = true)
  public void warmAvailableRoomsScheduled() {
    long startMs = System.currentTimeMillis();
    int totalCached = 0;

    try {
      List<Hostel> activeHostels = hostelRepository.findByActiveTrue();

      for (Hostel hostel : activeHostels) {
        for (Gender gender : Gender.values()) {
          try {
            // Load and cache available rooms for this hostel/gender
            List<Room> availableRooms =
                roomRepository.findAvailableByHostelIdAndGenderWithHostel(hostel.getId(), gender);

            if (!availableRooms.isEmpty()) {
              totalCached += availableRooms.size();
              log.debug(
                  "[CACHE-WARMING] Warmed {}x rooms for hostel {} gender {}",
                  availableRooms.size(), hostel.getName(), gender);
            }
          } catch (Exception e) {
            log.warn(
                "[CACHE-WARMING] Failed to warm rooms for hostel {} gender {}: {}",
                hostel.getName(), gender, e.getMessage());
          }
        }
      }

      long duration = System.currentTimeMillis() - startMs;
      log.info("[CACHE-WARMING] Scheduled room cache warming completed: {} records in {}ms", totalCached, duration);
    } catch (Exception e) {
      log.warn("[CACHE-WARMING] Scheduled warming failed: {}", e.getMessage());
    }
  }

  /**
   * Manually warms available rooms cache for a specific hostel.
   * Useful after bulk admin operations (mass room creation, status changes).
   *
   * @param hostelId the hostel to warm cache for
   * @return number of rooms cached
   */
  @Transactional(readOnly = true)
  public int warmRoomsForHostel(Long hostelId) {
    long startMs = System.currentTimeMillis();
    int cached = 0;

    try {
      for (Gender gender : Gender.values()) {
        List<Room> rooms =
            roomRepository.findAvailableByHostelIdAndGenderWithHostel(hostelId, gender);
        cached += rooms.size();
      }

      long duration = System.currentTimeMillis() - startMs;
      log.info("[CACHE-WARMING] Manual room cache warming for hostel {}: {} records in {}ms",
          hostelId, cached, duration);
      return cached;
    } catch (Exception e) {
      log.warn("[CACHE-WARMING] Failed to warm rooms for hostel {}: {}", hostelId, e.getMessage());
      return 0;
    }
  }

  /**
   * Clears and refreshes the available rooms cache.
   * Useful when cache may have become stale or after bulk admin operations.
   * Broadcasts cache clear across all cache keys.
   */
  @CacheEvict(value = "available-rooms", allEntries = true)
  @Transactional(readOnly = true)
  public void refreshAvailableRoomsCache() {
    log.info("[CACHE-WARMING] Evicted all available-rooms cache entries");
    // Immediately re-warm with fresh data
    List<Hostel> activeHostels = hostelRepository.findByActiveTrue();
    int total = 0;

    for (Hostel hostel : activeHostels) {
      for (Gender gender : Gender.values()) {
        List<Room> rooms =
            roomRepository.findAvailableByHostelIdAndGenderWithHostel(hostel.getId(), gender);
        total += rooms.size();
      }
    }

    log.info("[CACHE-WARMING] Refreshed available-rooms cache with {} records", total);
  }

  /**
   * Gets statistics about cache warming.
   * Useful for monitoring and capacity planning.
   *
   * @return cache statistics object
   */
  @Transactional(readOnly = true)
  public CacheStatistics getStatistics() {
    int totalHostels = Math.toIntExact(hostelRepository.count());
    int totalRooms = Math.toIntExact(roomRepository.count());
    int availableRooms =
        Math.toIntExact(
            roomRepository.countByStatus(RoomStatus.AVAILABLE));
    long totalStudents = studentRepository.count();

    // Estimate cache memory usage (rough, for monitoring)
    // Each room response ~1KB, each hostel response ~500B
    int estimatedRoomsCached = Math.max(1, availableRooms); // Most will be cached
    int estimatedMemoryMb =
        (estimatedRoomsCached * 1024 + totalHostels * 512) / (1024 * 1024);

    return new CacheStatistics(
        totalHostels, totalRooms, availableRooms, totalStudents, estimatedMemoryMb);
  }

  /**
   * Statistics about cache state and resource usage.
   */
  public record CacheStatistics(
      int totalHostels,
      int totalRooms,
      int availableRooms,
      long totalStudents,
      int estimatedCacheMemoryMb) {

    @Override
    public String toString() {
      return String.format(
          "Hostels: %d | Total Rooms: %d | Available: %d | Students: %d | Est. Cache: %d MB",
          totalHostels, totalRooms, availableRooms, totalStudents, estimatedCacheMemoryMb);
    }
  }
}
