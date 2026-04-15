package com.hostelmanagement.web.admin;

import com.hostelmanagement.domain.PaymentStatus;
import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.domain.Hostel;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.domain.Booking;
import com.hostelmanagement.domain.Payment;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin analytics controller providing dashboard metrics data.
 * Includes occupancy rates, revenue over time, and other KPIs.
 */
@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

  private final BookingRepository bookingRepository;
  private final PaymentRepository paymentRepository;
  private final RoomRepository roomRepository;
  private final HostelRepository hostelRepository;

  public AdminAnalyticsController(
      BookingRepository bookingRepository,
      PaymentRepository paymentRepository,
      RoomRepository roomRepository,
      HostelRepository hostelRepository) {
    this.bookingRepository = bookingRepository;
    this.paymentRepository = paymentRepository;
    this.roomRepository = roomRepository;
    this.hostelRepository = hostelRepository;
  }

  /**
   * Get occupancy analytics - roomsBooked vs roomsEmpty by hostel.
   * Useful for pie charts and occupancy rate calculations.
   *
   * @return Map with occupancy data for each hostel
   */
  @GetMapping("/occupancy")
  public ResponseEntity<Map<String, Object>> getOccupancyAnalytics() {
    List<Hostel> hostels = hostelRepository.findAll();
    List<Room> allRooms = roomRepository.findAll();
    List<Booking> approvedBookings =
        bookingRepository.findByStatus(BookingStatus.APPROVED);

    // Extract room IDs from approved bookings to determine occupied rooms
    Set<Long> occupiedRoomIds =
        approvedBookings.stream()
            .map(b -> b.getRoom() != null ? b.getRoom().getId() : null)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    Map<String, Object> occupancyData = new LinkedHashMap<>();

    // Calculate for each hostel
    for (Hostel hostel : hostels) {
      List<Room> hostelRooms = allRooms.stream()
          .filter(r -> r.getHostel().getId().equals(hostel.getId()))
          .collect(Collectors.toList());

      int totalCapacity = hostelRooms.size();
      long bookedCount =
          hostelRooms.stream()
              .filter(r -> occupiedRoomIds.contains(r.getId()))
              .count();
      long emptyCount = totalCapacity - bookedCount;

      Map<String, Object> hostelData = new LinkedHashMap<>();
      hostelData.put("hostelName", hostel.getName());
      hostelData.put("totalRooms", totalCapacity);
      hostelData.put("bookedRooms", bookedCount);
      hostelData.put("emptyRooms", emptyCount);
      hostelData.put("occupancyRate", totalCapacity > 0 ? (bookedCount * 100.0 / totalCapacity) : 0);

      occupancyData.put(hostel.getName(), hostelData);
    }

    // Calculate overall statistics
    Map<String, Object> overall = new LinkedHashMap<>();
    int totalRoomsAllHostels = allRooms.size();
    long totalBookedRooms = occupiedRoomIds.size();
    long totalEmptyRooms = totalRoomsAllHostels - totalBookedRooms;

    overall.put("totalRooms", totalRoomsAllHostels);
    overall.put("bookedRooms", totalBookedRooms);
    overall.put("emptyRooms", totalEmptyRooms);
    overall.put("occupancyRate",
        totalRoomsAllHostels > 0 ? (totalBookedRooms * 100.0 / totalRoomsAllHostels) : 0);

    occupancyData.put("overall", overall);

    return ResponseEntity.ok(occupancyData);
  }

  /**
   * Get revenue analytics - total payments by month for the last 12 months.
   * Useful for bar charts and revenue trend analysis.
   *
   * @return List of monthly revenue data
   */
  @GetMapping("/revenue")
  public ResponseEntity<List<Map<String, Object>>> getRevenueAnalytics() {
    List<Payment> completedPayments =
        paymentRepository.findAll().stream()
            .filter(p -> p.getStatus() == PaymentStatus.COMPLETED && p.getPaidAt() != null)
            .collect(Collectors.toList());

    // Get last 12 months of data
    LocalDate today = LocalDate.now();
    LocalDate twelveMonthsAgo = today.minusMonths(11);
    YearMonth startMonth = YearMonth.from(twelveMonthsAgo);

    // Initialize map for each month
    Map<YearMonth, BigDecimal> monthlyRevenue = new TreeMap<>();
    for (int i = 0; i < 12; i++) {
      monthlyRevenue.put(startMonth.plusMonths(i), BigDecimal.ZERO);
    }

    // Aggregate payments by month
    for (Payment payment : completedPayments) {
      Instant paidAt = payment.getPaidAt();
      if (paidAt != null) {
        LocalDate paymentDate = paidAt.atZone(ZoneId.systemDefault()).toLocalDate();
        YearMonth paymentMonth = YearMonth.from(paymentDate);

        if (!paymentMonth.isBefore(startMonth)) {
          monthlyRevenue.merge(
              paymentMonth,
              payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO,
              BigDecimal::add);
        }
      }
    }

    // Convert to list for JSON response
    List<Map<String, Object>> result = new ArrayList<>();
    for (Map.Entry<YearMonth, BigDecimal> entry : monthlyRevenue.entrySet()) {
      Map<String, Object> monthData = new LinkedHashMap<>();
      monthData.put("month", entry.getKey().toString()); // Format: YYYY-MM
      monthData.put("monthDisplay", entry.getKey().format(java.time.format.DateTimeFormatter.ofPattern("MMM yyyy")));
      monthData.put("revenue", entry.getValue());
      result.add(monthData);
    }

    return ResponseEntity.ok(result);
  }

  /**
   * Get summary statistics for the admin dashboard.
   * Includes total bookings, revenue, occupancy rate, etc.
   *
   * @return Summary statistics map
   */
  @GetMapping("/summary")
  public ResponseEntity<Map<String, Object>> getSummaryStatistics() {
    List<Booking> allBookings = bookingRepository.findAll();
    List<Booking> approvedBookings =
        bookingRepository.findByStatus(BookingStatus.APPROVED);
    List<Booking> pendingPaymentBookings =
        bookingRepository.findByStatus(BookingStatus.PENDING_PAYMENT);

    // Calculate revenue
    List<Payment> completedPayments =
        paymentRepository.findAll().stream()
            .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
            .collect(Collectors.toList());

    BigDecimal totalRevenue = completedPayments.stream()
        .map(Payment::getAmount)
        .filter(Objects::nonNull)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    // Get occupancy stats
    List<Room> allRooms = roomRepository.findAll();
    Set<Long> occupiedRoomIds = approvedBookings.stream()
        .map(b -> b.getRoom() != null ? b.getRoom().getId() : null)
        .filter(Objects::nonNull)
        .collect(Collectors.toSet());

    Map<String, Object> summary = new LinkedHashMap<>();
    summary.put("totalBookings", allBookings.size());
    summary.put("approvedBookings", approvedBookings.size());
    summary.put("pendingPaymentBookings", pendingPaymentBookings.size());
    summary.put("totalRooms", allRooms.size());
    summary.put("occupiedRooms", occupiedRoomIds.size());
    summary.put("emptyRooms", allRooms.size() - occupiedRoomIds.size());
    summary.put("occupancyRate",
        allRooms.size() > 0 ? (occupiedRoomIds.size() * 100.0 / allRooms.size()) : 0);
    summary.put("totalRevenue", totalRevenue);
    summary.put("completedPayments", completedPayments.size());
    summary.put("timestamp", Instant.now().toString());

    return ResponseEntity.ok(summary);
  }
}
