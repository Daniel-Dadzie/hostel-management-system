# PDF Allocation Letters & Payment Receipts Implementation Guide

## Overview
This implementation adds professional PDF generation for hostel allocation letters and payment receipts. Students can download these documents after successful payment confirmation.

## Features Implemented

### 1. **PDF Generation Service** (`PdfAllocationLetterService`)
- Generates professional, printable allocation letters with:
  - University header with optional logo
  - Student details (ID, name, email, level)
  - Room allocation information
  - Payment details
  - Terms and conditions
  - Official signature block
- Payment receipts with:
  - Payer information
  - Payment details (amount, method, date, reference)
  - Transaction confirmation
  - Receipt number and date

### 2. **Backend API Endpoints**
```
GET /api/student/payments/{bookingId}/allocation-letter
- Returns PDF file for download
- Only available for APPROVED bookings
- Validates student ownership

GET /api/student/payments/{bookingId}/receipt  
- Returns PDF payment receipt
- Available for PENDING and COMPLETED payments
- Validates student ownership
```

### 3. **Frontend UI Enhancement**
- New "Download Documents" section on My Payments page
- Visible only when booking status is APPROVED
- Download buttons for:
  - 📄 Allocation Letter
  - 🧾 Payment Receipt
- Loading states and error handling
- User feedback messages

## Implementation Details

### Backend Technologies
- **Library**: iText 7.2.5 (Professional PDF generation)
- **Framework**: Spring Boot 3.3.3
- **Language**: Java 21

### Key Components

#### PdfAllocationLetterService
```java
// Main generation methods
public byte[] generateAllocationLetterPdf(Student, Booking, Payment)
public byte[] generatePaymentReceiptPdf(Student, Payment, Booking)
```

#### StudentPaymentService (Enhanced)
```java
// PDF download endpoints
public byte[] generateAllocationLetterPdf(Long studentId, Long bookingId)
public byte[] generatePaymentReceiptPdf(Long studentId, Long bookingId)
```

#### StudentPaymentController (Enhanced)
```java
// REST endpoints
@GetMapping("/{bookingId}/allocation-letter")
@GetMapping("/{bookingId}/receipt")
```

## Customization Guide

### 1. Update University Information
Edit `PdfAllocationLetterService.java` (lines 31-32):
```java
private static final String UNIVERSITY_NAME = "Your University Name";
private static final String UNIVERSITY_CONTACT = "Your Contact Info | Tel: +XXX XXX XXX";
```

### 2. Add University Logo
1. Prepare a PNG image (recommended: 200x200px)
2. Place at: `backend/app/src/main/resources/logo.png`
3. File will be automatically loaded if present
4. If missing, PDFs still generate (logo optional)

### 3. Customize Hostel Terms
Edit `PdfAllocationLetterService.java` lines 425-430:
```java
String[] terms = {
  "1. Your custom term here.",
  "2. Add as many terms as needed.",
  // ...
};
```

### 4. Update Contact Information
Edit `PdfAllocationLetterService.java` line 498:
```java
"Thank you for your payment. For inquiries, contact: your-email@university.edu.gh"
```

## Setup Instructions

### Step 1: Build Backend
```bash
cd backend/app
# Windows
mvnw.cmd clean package

# Linux/Mac
./mvnw clean package
```

### Step 2: Build Frontend
```bash
cd frontend
npm install
npm run build
```

### Step 3: Test the Feature
1. Start the backend server
2. Navigate to student dashboard
3. Complete a hostel booking and payment
4. Once booking status is APPROVED, navigate to "My Payments"
5. You should see "Download Documents" section with two buttons
6. Click "Download Allocation Letter" - should save as `allocation-letter-{bookingId}.pdf`
7. Click "Download Payment Receipt" - should save as `payment-receipt-{bookingId}.pdf`

## API Response Examples

### Allocation Letter Endpoint
```
GET /api/student/payments/123/allocation-letter
Content-Type: application/pdf
Content-Disposition: attachment; filename="allocation-letter-123.pdf"

[Binary PDF Content]
```

### Payment Receipt Endpoint
```
GET /api/student/payments/123/receipt
Content-Type: application/pdf
Content-Disposition: attachment; filename="payment-receipt-123.pdf"

[Binary PDF Content]
```

## Error Handling

### Common Error Scenarios
| Error | Cause | Solution |
|-------|-------|----------|
| "Booking not found" | Invalid booking ID | Verify booking ID is correct |
| "You can only access your own booking" | Student ID mismatch | Ensure user is authenticated |
| "Allocation letter is only available after successful payment" | Booking not APPROVED | Complete payment first |
| "Payment record not found" | No payment associated with booking | Create payment before downloading |

## Security Features

### Access Control
- ✅ User authentication required for all endpoints
- ✅ Student can only download their own documents
- ✅ Validates booking ownership before PDF generation
- ✅ Payment status verification before document generation

### Data Validation
- ✅ Booking ID existence check
- ✅ Student ownership verification
- ✅ Payment status validation
- ✅ Proper exception handling

## Dependencies Added

### Maven (pom.xml)
```xml
<dependency>
  <groupId>com.itextpdf</groupId>
  <artifactId>itext7-core</artifactId>
  <version>7.2.5</version>
</dependency>
```

## File Changes Summary

### New Files
- `backend/app/src/main/java/com/hostelmanagement/service/PdfAllocationLetterService.java`

### Modified Files
- `backend/app/pom.xml` - Added iText dependency
- `backend/app/src/main/java/com/hostelmanagement/service/StudentPaymentService.java` - Added PDF generation methods
- `backend/app/src/main/java/com/hostelmanagement/web/student/StudentPaymentController.java` - Added download endpoints
- `frontend/src/pages/student/MyPaymentsPage.jsx` - Added download UI
- `frontend/src/services/studentService.js` - Added download functions

## Performance Considerations

### PDF Generation
- ✅ Lazy loaded (generated only when requested)
- ✅ No database storage (generated on-demand)
- ✅ Efficient memory usage with ByteArrayOutputStream
- ✅ Suitable for high-traffic scenarios

### Browser Download
- ✅ Automatic trigger using Blob API
- ✅ Proper MIME type handling
- ✅ Filename set in Content-Disposition header
- ✅ Works across all modern browsers

## Testing Scenarios

### Test Case 1: Happy Path
1. ✅ Create booking
2. ✅ Submit payment
3. ✅ Booking approved
4. ✅ Download both documents
5. ✅ Verify content is correct

### Test Case 2: Access Control
1. ✅ Try to download without payment
2. ✅ Try to download with wrong student ID
3. ✅ Try to download invalid booking
4. ✅ All should return appropriate errors

### Test Case 3: Logo Handling
1. ✅ Download with logo present
2. ✅ Download with logo missing
3. ✅ Both should work correctly

## Troubleshooting

### PDF Not Downloading
- Check browser download folder
- Verify CORS settings allow PDF responses
- Check browser console for network errors

### Missing Student Data
- Verify student profile is complete
- Check room is assigned to booking
- Verify payment record exists

### Logo Not Showing
- Check file exists at `src/main/resources/logo.png`
- Verify PNG format (not JPG or GIF)
- Check file size (should be < 1MB)
- Restart backend after adding logo

### Date/Formatting Issues
- Verify system timezone is set correctly
- Check date format in PdfAllocationLetterService (line 28)
- PDF dates use ISO format (dd MMM yyyy)

## Future Enhancements

Potential improvements for future versions:
- [ ] Email PDF to students automatically after payment
- [ ] Batch download multiple receipts
- [ ] Digital signature support
- [ ] Custom branding/theming per hostel
- [ ] Receipt number auto-generation
- [ ] Archive/history of generated PDFs
- [ ] Multi-language support
- [ ] QR code for verification

## Support & Documentation

### Code Documentation
- All classes and methods include JavaDoc comments
- Clear separation of concerns
- Extensible design for future modifications

### UI/UX
- Loading states for all downloads
- Clear error messages
- Success notifications
- Responsive button layout

## Deployment Checklist

- [ ] Add logo.png to resources folder (optional)
- [ ] Update university information in PdfAllocationLetterService
- [ ] Update terms and conditions text
- [ ] Update contact information
- [ ] Run `mvnw clean package` for backend
- [ ] Run `npm run build` for frontend
- [ ] Test full payment flow end-to-end
- [ ] Verify PDF downloads work in production
- [ ] Test with multiple different bookings
- [ ] Verify error handling works correctly

## Questions or Issues?

For implementation details, refer to:
1. `PdfAllocationLetterService.java` - PDF generation logic
2. `StudentPaymentService.java` - Business logic
3. `StudentPaymentController.java` - API endpoints
4. `MyPaymentsPage.jsx` - Frontend UI
5. `studentService.js` - API client functions
