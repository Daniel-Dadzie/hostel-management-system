package com.hostelmanagement.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
    name = "payments",
    indexes = {
      @Index(name = "idx_payments_status", columnList = "status"),
      @Index(name = "idx_payments_booking", columnList = "booking_id"),
      @Index(name = "idx_payments_student", columnList = "student_id"),
      @Index(name = "idx_payments_transaction_ref", columnList = "transaction_reference"),
      @Index(name = "idx_payments_student_status", columnList = "student_id,status")
    })
@SuppressWarnings({"java:S1068", "java:S1144"})
public class Payment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "student_id", nullable = false)
  private Student student;

  @OneToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id", nullable = false)
  private Booking booking;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal amount;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PaymentStatus status;

  @Column(name = "due_at", nullable = false)
  private Instant dueAt;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_method", length = 30)
  private PaymentMethod paymentMethod;

  @Column(name = "transaction_reference", length = 120)
  private String transactionReference;

  @Column(name = "receipt_filename", length = 255)
  private String receiptFilename;

  @Column(name = "receipt_content_type", length = 120)
  private String receiptContentType;

  @Column(name = "receipt_storage_path", length = 500)
  private String receiptStoragePath;

  @Column(name = "paid_at")
  private Instant paidAt;

  @SuppressWarnings("unused") // Managed by JPA lifecycle callbacks.
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @SuppressWarnings("unused") // Managed by JPA lifecycle callbacks.
  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  @SuppressWarnings("unused") // Invoked reflectively by JPA.
  void onCreate() {
    Instant now = Instant.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  @SuppressWarnings("unused") // Invoked reflectively by JPA.
  void onUpdate() {
    this.updatedAt = Instant.now();
  }

  public Long getId() {
    return id;
  }

  public Student getStudent() {
    return student;
  }

  public void setStudent(Student student) {
    this.student = student;
  }

  public Booking getBooking() {
    return booking;
  }

  public void setBooking(Booking booking) {
    this.booking = booking;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }

  public PaymentStatus getStatus() {
    return status;
  }

  public void setStatus(PaymentStatus status) {
    this.status = status;
  }

  public Instant getDueAt() {
    return dueAt;
  }

  public void setDueAt(Instant dueAt) {
    this.dueAt = dueAt;
  }

  public PaymentMethod getPaymentMethod() {
    return paymentMethod;
  }

  public void setPaymentMethod(PaymentMethod paymentMethod) {
    this.paymentMethod = paymentMethod;
  }

  public String getTransactionReference() {
    return transactionReference;
  }

  public void setTransactionReference(String transactionReference) {
    this.transactionReference = transactionReference;
  }

  public String getReceiptFilename() {
    return receiptFilename;
  }

  public void setReceiptFilename(String receiptFilename) {
    this.receiptFilename = receiptFilename;
  }

  public String getReceiptContentType() {
    return receiptContentType;
  }

  public void setReceiptContentType(String receiptContentType) {
    this.receiptContentType = receiptContentType;
  }

  public String getReceiptStoragePath() {
    return receiptStoragePath;
  }

  public void setReceiptStoragePath(String receiptStoragePath) {
    this.receiptStoragePath = receiptStoragePath;
  }

  public Instant getPaidAt() {
    return paidAt;
  }

  public void setPaidAt(Instant paidAt) {
    this.paidAt = paidAt;
  }
}
