package com.hostelmanagement.scheduler;

import com.hostelmanagement.service.AcademicRolloverService;
import com.hostelmanagement.service.AcademicRolloverService.RolloverRunSummary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AcademicRolloverScheduler {

  private static final Logger log = LoggerFactory.getLogger(AcademicRolloverScheduler.class);

  private final AcademicRolloverService academicRolloverService;

  public AcademicRolloverScheduler(AcademicRolloverService academicRolloverService) {
    this.academicRolloverService = academicRolloverService;
  }

  @Scheduled(cron = "${app.academic.rollover-cron:0 0 0 * * *}")
  public void runAnnualRollover() {
    RolloverRunSummary summary = academicRolloverService.runTermEndCheckoutIfDue();
    if (!summary.triggered()) {
      return;
    }

    log.info(
        "Semester-end checkout completed for {}/{}. Checked out bookings: {}",
        summary.academicYear(),
        summary.semester(),
        summary.checkedOutBookings());
  }
}
