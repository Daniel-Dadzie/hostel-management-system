package com.hostelmanagement.scheduler;

import com.hostelmanagement.domain.Booking;
import com.hostelmanagement.domain.Payment;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.service.NotificationService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BookingExpirationScheduler {

  private static final Logger log = LoggerFactory.getLogger(BookingExpirationScheduler.class);

  private final BookingRepository bookingRepository;
  private final PaymentRepository paymentRepository;
  private final NotificationService notificationService;
  private final long holdMinutes;
  private final long reminderHoursBeforeExpiry;

  public BookingExpirationScheduler(
      BookingRepository bookingRepository,
      PaymentRepository paymentRepository,
      NotificationService notificationService,
      @Value("${app.booking.payment-hold-minutes}") long holdMinutes,
      @Value("${app.booking.reminder-hours-before-expiry:24}") long reminderHoursBeforeExpiry) {
    this.bookingRepository = bookingRepository;
    this.paymentRepository = paymentRepository;
    this.notificationService = notificationService;
    this.holdMinutes = holdMinutes;
    this.reminderHoursBeforeExpiry = reminderHoursBeforeExpiry;
  }

  @Scheduled(fixedDelayString = "${app.booking.expiration-cron-ms}")
  public void expirePendingBookings() {
    Instant cutoff = Instant.now().minus(holdMinutes, ChronoUnit.MINUTES);
    bookingRepository.findByStatusAndCreatedAtBefore(
        com.hostelmanagement.domain.BookingStatus.PENDING_PAYMENT, cutoff)
        .forEach(booking -> {
          booking.setStatus(com.hostelmanagement.domain.BookingStatus.EXPIRED);
          bookingRepository.save(booking);
          
          paymentRepository.findByBookingId(booking.getId())
              .ifPresent(payment -> {
                payment.setStatus(com.hostelmanagement.domain.PaymentStatus.CANCELLED);
                paymentRepository.save(payment);
              });
        });
  }

  /**
   * Send reminder emails 24 hours before booking expires.
   * Runs every hour to check for upcoming expirations.
   */
  @Scheduled(fixedRate = 3600000) // Every hour
  public void sendExpirationReminders() {
    log.info("Running expiration reminder job");
    
    Instant reminderTime = Instant.now().plus(reminderHoursBeforeExpiry, ChronoUnit.HOURS);
    Instant windowStart = reminderTime.minus(30, ChronoUnit.MINUTES); // 30 min window
    Instant windowEnd = reminderTime.plus(30, ChronoUnit.MINUTES);
    
    List<Booking> pendingBookings = bookingRepository.findByStatus(
        com.hostelmanagement.domain.BookingStatus.PENDING_PAYMENT);
    
    for (Booking booking : pendingBookings) {
      if (booking.getCreatedAt() == null) continue;
      
      Instant expiryTime = booking.getCreatedAt().plus(holdMinutes, ChronoUnit.MINUTES);
      
      // Check if we're within the reminder window
      if (expiryTime.isAfter(windowStart) && expiryTime.isBefore(windowEnd)) {
        try {
          paymentRepository.findByBookingId(booking.getId())
              .ifPresent(payment -> {
                String studentEmail = booking.getStudent().getEmail();
                String studentName = booking.getStudent().getFullName();
                String hostelName = booking.getRoom() != null && booking.getRoom().getHostel() != null
                    ? booking.getRoom().getHostel().getName()
                    : "your requested hostel";
                String roomNumber = booking.getRoom() != null
                    ? booking.getRoom().getRoomNumber()
                    : "";
                
                notificationService.sendPaymentReminder(
                    studentEmail,
                    studentName,
                    hostelName,
                    roomNumber,
                    expiryTime
                );
                log.info("Sent payment reminder to {} for booking {}", studentEmail, booking.getId());
              });
        } catch (Exception e) {
          log.error("Failed to send reminder for booking {}: {}", booking.getId(), e.getMessage());
        }
      }
    }
  }
}
