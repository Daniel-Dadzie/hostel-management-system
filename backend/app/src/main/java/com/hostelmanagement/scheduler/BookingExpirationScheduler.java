package com.hostelmanagement.scheduler;

import com.hostelmanagement.service.BookingService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BookingExpirationScheduler {

  private final BookingService bookingService;
  private final long holdMinutes;

  public BookingExpirationScheduler(
      BookingService bookingService,
      @Value("${app.booking.payment-hold-minutes}") long holdMinutes) {
    this.bookingService = bookingService;
    this.holdMinutes = holdMinutes;
  }

  @Scheduled(fixedDelayString = "${app.booking.expiration-cron-ms}")
  public void expirePendingBookings() {
    Instant cutoff = Instant.now().minus(holdMinutes, ChronoUnit.MINUTES);
    bookingService.expirePendingPayments(cutoff);
  }
}
