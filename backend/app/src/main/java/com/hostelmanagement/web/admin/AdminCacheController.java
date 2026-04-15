package com.hostelmanagement.web.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.hostelmanagement.service.CacheWarmingService;
import com.hostelmanagement.service.CacheWarmingService.CacheStatistics;

/**
 * Admin endpoint for cache management and monitoring.
 *
 * <p>Provides operations for:
 * <ul>
 *   <li>Manual cache warming (for use after bulk admin operations)
 *   <li>Cache statistics and monitoring
 *   <li>Cache refresh and invalidation
 * </ul>
 *
 * <p>All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/api/admin/cache")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCacheController {

  private final CacheWarmingService cacheWarmingService;

  public AdminCacheController(CacheWarmingService cacheWarmingService) {
    this.cacheWarmingService = cacheWarmingService;
  }

  /**
   * Gets current cache statistics and estimated memory usage.
   *
   * @return cache statistics
   */
  @GetMapping("/statistics")
  public ResponseEntity<CacheStatistics> getStatistics() {
    return ResponseEntity.ok(cacheWarmingService.getStatistics());
  }

  /**
   * Warms the active hostels cache.
   * Use after creating/modifying hostel data.
   */
  @PostMapping("/warm/hostels")
  public ResponseEntity<String> warmHostels() {
    cacheWarmingService.warmActiveHostelsOnStartup();
    return ResponseEntity.ok("Hostels cache warmed");
  }

  /**
   * Warms available rooms cache for a specific hostel.
   * Use after room inventory changes for a specific hostel.
   *
   * @param hostelId the hostel ID
   * @return number of rooms cached
   */
  @PostMapping("/warm/hostels/{hostelId}/rooms")
  public ResponseEntity<String> warmRoomsForHostel(@PathVariable Long hostelId) {
    int count = cacheWarmingService.warmRoomsForHostel(hostelId);
    return ResponseEntity.ok(String.format("Cached %d rooms for hostel %d", count, hostelId));
  }

  /**
   * Refreshes (clears and reloads) the available rooms cache.
   * Use after bulk room status changes or suspected cache staleness.
   */
  @PostMapping("/refresh/rooms")
  public ResponseEntity<String> refreshRoomsCache() {
    cacheWarmingService.refreshAvailableRoomsCache();
    return ResponseEntity.ok("Available rooms cache refreshed");
  }

  /**
   * Health check for caching system.
   *
   * @return health status
   */
  @GetMapping("/health")
  public ResponseEntity<String> healthCheck() {
    try {
      CacheStatistics stats = cacheWarmingService.getStatistics();
      return ResponseEntity.ok("Cache system healthy: " + stats);
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Cache system error: " + e.getMessage());
    }
  }
}
