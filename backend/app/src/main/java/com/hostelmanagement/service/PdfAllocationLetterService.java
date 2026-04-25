package com.hostelmanagement.service;

import com.hostelmanagement.domain.Booking;
import com.hostelmanagement.domain.Payment;
import com.hostelmanagement.domain.Room;
import com.hostelmanagement.domain.Student;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class PdfAllocationLetterService {

  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
  private static final float MARGIN = 36;
  private static final String UNIVERSITY_NAME = "University of Ghana";
  private static final String UNIVERSITY_CONTACT = "Admissions & Student Affairs | Tel: +233 XXX XXX XXX";

  private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
  private static final Font BOLD_FONT = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
  private static final Font REGULAR_FONT = new Font(Font.FontFamily.HELVETICA, 11);
  private static final Font SMALL_FONT = new Font(Font.FontFamily.HELVETICA, 10);
  private static final Font TINY_FONT = new Font(Font.FontFamily.HELVETICA, 8);

  public byte[] generateAllocationLetterPdf(Student student, Booking booking, Payment payment) {
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    try {
      Document document = new Document(PageSize.A4, MARGIN, MARGIN, MARGIN, MARGIN);
      PdfWriter.getInstance(document, outputStream);
      document.open();
      addHeader(document);
      addTitle(document, "HOSTEL ALLOCATION LETTER", "HMS/ALLOC/");
      addLetterContent(document, student, booking, payment);
      addFooter(document);
      document.close();
    } catch (DocumentException e) {
      throw new RuntimeException("Failed to generate allocation letter PDF", e);
    }
    return outputStream.toByteArray();
  }

  public byte[] generatePaymentReceiptPdf(Student student, Payment payment, Booking booking) {
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    try {
      Document document = new Document(PageSize.A4, MARGIN, MARGIN, MARGIN, MARGIN);
      PdfWriter.getInstance(document, outputStream);
      document.open();
      addHeader(document);
      addTitle(document, "PAYMENT RECEIPT", "HMS/RECEIPT/");
      addReceiptContent(document, student, payment, booking);
      addFooter(document);
      document.close();
    } catch (DocumentException e) {
      throw new RuntimeException("Failed to generate payment receipt PDF", e);
    }
    return outputStream.toByteArray();
  }

  private void addHeader(Document document) throws DocumentException {
    try {
      ClassPathResource logoResource = new ClassPathResource("logo.png");
      if (logoResource.exists()) {
        try (InputStream logoInputStream = logoResource.getInputStream()) {
          Image logo = Image.getInstance(logoInputStream.readAllBytes());
          logo.setAlignment(Element.ALIGN_CENTER);
          logo.scaleToFit(60, 60);
          document.add(logo);
        }
      }
    } catch (Exception e) {
      // Logo optional
    }
    Paragraph universityName = new Paragraph(UNIVERSITY_NAME, BOLD_FONT);
    universityName.setAlignment(Element.ALIGN_CENTER);
    document.add(universityName);

    Paragraph contact = new Paragraph(UNIVERSITY_CONTACT, SMALL_FONT);
    contact.setAlignment(Element.ALIGN_CENTER);
    document.add(contact);
    document.add(new Paragraph("\n"));
  }

  private void addTitle(Document document, String titleText, String refPrefix) throws DocumentException {
    Paragraph title = new Paragraph(titleText, TITLE_FONT);
    title.setAlignment(Element.ALIGN_CENTER);
    title.setSpacingAfter(5);
    document.add(title);

    Paragraph reference = new Paragraph("Ref: " + refPrefix + System.currentTimeMillis(), SMALL_FONT);
    reference.setAlignment(Element.ALIGN_CENTER);
    reference.setSpacingAfter(20);
    document.add(reference);
  }

  private void addLetterContent(Document document, Student student, Booking booking, Payment payment)
      throws DocumentException {
    Paragraph dateParagraph = new Paragraph("Date: " + java.time.LocalDate.now().format(DATE_FORMATTER), SMALL_FONT);
    dateParagraph.setSpacingAfter(20);
    document.add(dateParagraph);

    Paragraph salutation = new Paragraph("Dear " + student.getFullName() + ",", REGULAR_FONT);
    salutation.setSpacingAfter(15);
    document.add(salutation);

    Paragraph opening = new Paragraph(
        "Congratulations! We are pleased to inform you that your application for hostel "
            + "accommodation has been successful. This letter serves as your official allocation "
            + "notice and confirms your hostel placement for the academic year "
            + booking.getAcademicYear() + ".",
        REGULAR_FONT);
    opening.setSpacingAfter(15);
    document.add(opening);

    Paragraph detailsTitle = new Paragraph("ALLOCATION DETAILS", BOLD_FONT);
    detailsTitle.setSpacingAfter(10);
    detailsTitle.setSpacingBefore(10);
    document.add(detailsTitle);

    PdfPTable detailsTable = new PdfPTable(2);
    detailsTable.setWidthPercentage(100);
    detailsTable.setSpacingAfter(15);

    Room room = booking.getRoom();
    String hostelName = room != null && room.getHostel() != null ? room.getHostel().getName() : "Not Yet Assigned";
    String roomNumber = room != null && room.getRoomNumber() != null ? room.getRoomNumber() : "To Be Assigned";
    String roomType = room != null && room.getRoomType() != null ? room.getRoomType().toString() : "N/A";
    String floorNumber = room != null ? String.valueOf(room.getFloorNumber()) : "N/A";

    addDetailRow(detailsTable, "Student ID:", student.getId().toString());
    addDetailRow(detailsTable, "Full Name:", student.getFullName());
    addDetailRow(detailsTable, "Email:", student.getEmail());
    addDetailRow(detailsTable, "Level:", student.getCurrentLevel() + "00");
    addDetailRow(detailsTable, "Hostel:", hostelName);
    addDetailRow(detailsTable, "Room Number:", roomNumber);
    addDetailRow(detailsTable, "Room Type:", roomType);
    addDetailRow(detailsTable, "Floor Number:", floorNumber);
    addDetailRow(detailsTable, "Academic Year:", booking.getAcademicYear());
    addDetailRow(detailsTable, "Academic Session:", booking.getAcademicSession());
    document.add(detailsTable);

    Paragraph paymentTitle = new Paragraph("PAYMENT INFORMATION", BOLD_FONT);
    paymentTitle.setSpacingAfter(10);
    paymentTitle.setSpacingBefore(10);
    document.add(paymentTitle);

    PdfPTable paymentTable = new PdfPTable(2);
    paymentTable.setWidthPercentage(100);
    paymentTable.setSpacingAfter(15);

    addDetailRow(paymentTable, "Amount Paid:", formatAmount(payment.getAmount()));
    addDetailRow(paymentTable, "Payment Date:",
        payment.getPaidAt() != null
            ? java.time.Instant.ofEpochSecond(payment.getPaidAt().getEpochSecond())
                .atZone(java.time.ZoneId.systemDefault())
                .format(DATE_FORMATTER)
            : "Pending");
    addDetailRow(
      paymentTable,
      "Payment Method:",
      payment.getPaymentMethod() != null ? payment.getPaymentMethod().toString() : "N/A");
    addDetailRow(paymentTable, "Transaction Reference:",
        payment.getTransactionReference() != null ? payment.getTransactionReference() : "N/A");
    document.add(paymentTable);

    Paragraph termsTitle = new Paragraph("TERMS AND CONDITIONS", BOLD_FONT);
    termsTitle.setSpacingAfter(10);
    termsTitle.setSpacingBefore(15);
    document.add(termsTitle);

    String[] terms = {
        "1. This allocation letter is valid for the academic year " + booking.getAcademicYear() + ".",
        "2. You are required to register your details at the hostel office within 48 hours of receiving this letter.",
        "3. Students must comply with all hostel rules and regulations.",
        "4. Damages to hostel property will be charged to the student's account.",
        "5. The allocation is subject to satisfactory conduct and academic standing.",
        "6. Failure to check in within the allocated time may result in the room being reassigned."
    };

    for (String term : terms) {
      Paragraph termParagraph = new Paragraph(term, SMALL_FONT);
      termParagraph.setSpacingAfter(5);
      document.add(termParagraph);
    }

    Paragraph closing = new Paragraph(
        "\nWe wish you a pleasant stay in our facilities. Should you have any inquiries, "
            + "please contact the Admissions & Student Affairs office.",
        REGULAR_FONT);
    closing.setSpacingBefore(20);
    closing.setSpacingAfter(20);
    document.add(closing);

    Paragraph closing2 = new Paragraph("Yours faithfully,", REGULAR_FONT);
    closing2.setSpacingAfter(40);
    document.add(closing2);

    Paragraph signature = new Paragraph("Hostel Management System\n" + UNIVERSITY_NAME, BOLD_FONT);
    document.add(signature);
  }

  private void addReceiptContent(Document document, Student student, Payment payment, Booking booking)
      throws DocumentException {
    Paragraph dateParagraph = new Paragraph("Date: " + java.time.LocalDate.now().format(DATE_FORMATTER), SMALL_FONT);
    dateParagraph.setSpacingAfter(20);
    document.add(dateParagraph);

    Font greenFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.GREEN);
    Paragraph status = new Paragraph("PAYMENT CONFIRMED", greenFont);
    status.setAlignment(Element.ALIGN_CENTER);
    status.setSpacingAfter(20);
    document.add(status);

    Paragraph payerTitle = new Paragraph("PAYER INFORMATION", BOLD_FONT);
    payerTitle.setSpacingAfter(10);
    payerTitle.setSpacingBefore(10);
    document.add(payerTitle);

    PdfPTable payerTable = new PdfPTable(2);
    payerTable.setWidthPercentage(100);
    payerTable.setSpacingAfter(15);

    addDetailRow(payerTable, "Student ID:", student.getId().toString());
    addDetailRow(payerTable, "Student Name:", student.getFullName());
    addDetailRow(payerTable, "Email:", student.getEmail());
    addDetailRow(payerTable, "Phone:", student.getPhone() != null ? student.getPhone() : "N/A");
    document.add(payerTable);

    Paragraph paymentDetailsTitle = new Paragraph("PAYMENT DETAILS", BOLD_FONT);
    paymentDetailsTitle.setSpacingAfter(10);
    paymentDetailsTitle.setSpacingBefore(10);
    document.add(paymentDetailsTitle);

    PdfPTable paymentDetailsTable = new PdfPTable(2);
    paymentDetailsTable.setWidthPercentage(100);
    paymentDetailsTable.setSpacingAfter(15);

    addDetailRow(paymentDetailsTable, "Booking ID:", booking.getId().toString());
    addDetailRow(paymentDetailsTable, "Amount Paid:", formatAmount(payment.getAmount()));
    addDetailRow(paymentDetailsTable, "Payment Date:",
        payment.getPaidAt() != null
            ? java.time.Instant.ofEpochSecond(payment.getPaidAt().getEpochSecond())
                .atZone(java.time.ZoneId.systemDefault())
                .format(DATE_FORMATTER)
            : "Pending");
    addDetailRow(paymentDetailsTable, "Payment Method:",
        payment.getPaymentMethod() != null ? payment.getPaymentMethod().toString() : "N/A");
    addDetailRow(paymentDetailsTable, "Transaction Reference:",
        payment.getTransactionReference() != null ? payment.getTransactionReference() : "N/A");
    addDetailRow(paymentDetailsTable, "Payment Status:",
      payment.getStatus() != null ? payment.getStatus().toString() : "N/A");
    document.add(paymentDetailsTable);

    Font darkGrayFont = new Font(Font.FontFamily.HELVETICA, 10);
    darkGrayFont.setColor(BaseColor.DARK_GRAY);
    Paragraph note = new Paragraph(
        "This receipt confirms that payment has been successfully received and processed. "
            + "Please keep this receipt for your records.",
        darkGrayFont);
    note.setSpacingBefore(20);
    note.setSpacingAfter(20);
    document.add(note);

    Paragraph footer = new Paragraph(
        "Thank you for your payment. For inquiries, contact: admissions@university.edu.gh",
        darkGrayFont);
    footer.setAlignment(Element.ALIGN_CENTER);
    footer.setSpacingBefore(30);
    document.add(footer);
  }

  private void addDetailRow(PdfPTable table, String label, String value) {
    PdfPCell labelCell = new PdfPCell(new Phrase(label, BOLD_FONT));
    labelCell.setBorder(Rectangle.NO_BORDER);
    labelCell.setPadding(5);

    PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "N/A", REGULAR_FONT));
    valueCell.setBorder(Rectangle.NO_BORDER);
    valueCell.setPadding(5);

    table.addCell(labelCell);
    table.addCell(valueCell);
  }

  private String formatAmount(BigDecimal amount) {
    return String.format("GHS %.2f", amount != null ? amount : BigDecimal.ZERO);
  }

  private void addFooter(Document document) throws DocumentException {
    document.add(new Paragraph("\n"));
    Font darkGrayFont = new Font(Font.FontFamily.HELVETICA, 8);
    darkGrayFont.setColor(BaseColor.DARK_GRAY);
    Paragraph footerText = new Paragraph(
        "Hostel Management System | " + UNIVERSITY_NAME + " | Generated on "
            + java.time.LocalDate.now().format(DATE_FORMATTER),
        darkGrayFont);
    footerText.setAlignment(Element.ALIGN_CENTER);
    document.add(footerText);
  }
}
