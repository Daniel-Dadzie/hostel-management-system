package com.hostelmanagement.web.notification;

import java.time.Instant;
import java.util.Objects;

/**
 * Represents a real-time notification message sent over WebSocket.
 *
 * <p>This DTO is used to send structured notifications to students about their booking/payment
 * status changes.
 */
public class NotificationMessage {

  private Long studentId;
  private String type; // PAYMENT_APPROVED, BOOKING_APPROVED, etc.
  private String title;
  private String message;
  private String severity; // success, warning, error, info
  private Long bookingId;
  private Long paymentId;
  private Instant timestamp;

  // Default constructor for JSON deserialization
  public NotificationMessage() {
    this.timestamp = Instant.now();
  }

  /**
   * Creates a notification for payment approval.
   *
   * @param studentId the student receiving the notification
   * @param bookingId the booking ID
   * @param paymentId the payment ID
   * @return notification message
   */
  public static NotificationMessage paymentApproved(Long studentId, Long bookingId, Long paymentId) {
    NotificationMessage msg = new NotificationMessage();
    msg.studentId = studentId;
    msg.type = "PAYMENT_APPROVED";
    msg.title = "Payment Approved";
    msg.message = "Your payment has been approved. Your room allocation is confirmed!";
    msg.severity = "success";
    msg.bookingId = bookingId;
    msg.paymentId = paymentId;
    msg.timestamp = Instant.now();
    return msg;
  }

  /**
   * Creates a notification for booking approval.
   *
   * @param studentId the student receiving the notification
   * @param bookingId the booking ID
   * @return notification message
   */
  public static NotificationMessage bookingApproved(Long studentId, Long bookingId) {
    NotificationMessage msg = new NotificationMessage();
    msg.studentId = studentId;
    msg.type = "BOOKING_APPROVED";
    msg.title = "Booking Approved";
    msg.message = "Your booking has been approved by the admin.";
    msg.severity = "success";
    msg.bookingId = bookingId;
    msg.timestamp = Instant.now();
    return msg;
  }

  /**
   * Creates a notification for booking rejection.
   *
   * @param studentId the student receiving the notification
   * @param bookingId the booking ID
   * @param reason optional rejection reason
   * @return notification message
   */
  public static NotificationMessage bookingRejected(Long studentId, Long bookingId, String reason) {
    NotificationMessage msg = new NotificationMessage();
    msg.studentId = studentId;
    msg.type = "BOOKING_REJECTED";
    msg.title = "Booking Rejected";
    msg.message = Objects.requireNonNullElse(reason, "Your booking has been rejected.");
    msg.severity = "error";
    msg.bookingId = bookingId;
    msg.timestamp = Instant.now();
    return msg;
  }

  // Getters and setters
  public Long getStudentId() {
    return studentId;
  }

  public void setStudentId(Long studentId) {
    this.studentId = studentId;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getSeverity() {
    return severity;
  }

  public void setSeverity(String severity) {
    this.severity = severity;
  }

  public Long getBookingId() {
    return bookingId;
  }

  public void setBookingId(Long bookingId) {
    this.bookingId = bookingId;
  }

  public Long getPaymentId() {
    return paymentId;
  }

  public void setPaymentId(Long paymentId) {
    this.paymentId = paymentId;
  }

  public Instant getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(Instant timestamp) {
    this.timestamp = timestamp;
  }

  @Override
  public String toString() {
    return "NotificationMessage{"
        + "studentId="
        + studentId
        + ", type='"
        + type
        + '\''
        + ", title='"
        + title
        + '\''
        + ", message='"
        + message
        + '\''
        + ", severity='"
        + severity
        + '\''
        + ", bookingId="
        + bookingId
        + ", paymentId="
        + paymentId
        + ", timestamp="
        + timestamp
        + '}';
  }
}
