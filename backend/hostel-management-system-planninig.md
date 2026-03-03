# University Hostel Management System - Implementation Checklist (Mapped to Current Codebase)

This checklist converts the updated architecture into executable tasks against your existing project structure.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## Phase 0 - Baseline Alignment (Current vs Target)

### What is already in code
- [x] Auth endpoints and JWT flow exist.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/web/AuthController.java`
  - Backend: `backend/app/src/main/java/com/hostelmanagement/service/AuthService.java`
  - Frontend: `frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/RegisterPage.jsx`, `frontend/src/context/AuthContext.jsx`
- [x] Student booking apply endpoint exists.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/web/student/StudentBookingController.java`
  - Backend: `backend/app/src/main/java/com/hostelmanagement/service/BookingService.java`
- [x] Booking expiration scheduler exists.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/scheduler/BookingExpirationScheduler.java`
- [x] Room capacity/occupancy/version model exists.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/domain/Room.java`

### Gaps against new plan (must be implemented)
- [ ] Student-selected hostel is not enforced in backend allocation.
  - Current behavior: auto-scan hostels in `BookingService.allocateRoom(...)`
- [ ] Room selection by explicit room ID is missing.
- [ ] Hostel distance field is missing in entity/DTO/migration.
- [ ] Dedicated student hostel/room discovery endpoints are missing.
- [ ] Payment methods (Visa/MoMo/Cash), receipt upload, booking reference are missing.
- [ ] Student payment flow page/actions are mostly placeholders.

---

## Phase 1 - Data Model & Database Changes

### 1.1 Hostel distance and visibility
- [ ] Add `distance_to_campus_km` to hostel table.
  - Migration: create `backend/app/src/main/resources/db/migration/V7__add_hostel_distance.sql`
- [ ] Add distance field to entity and DTOs.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/domain/Hostel.java`
  - Backend: `backend/app/src/main/java/com/hostelmanagement/web/dto/HostelResponse.java`
  - Backend: `backend/app/src/main/java/com/hostelmanagement/web/admin/dto/UpsertHostelRequest.java`
- [ ] Update admin hostel service/controller to save and return distance.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/service/AdminHostelService.java`
  - Backend: `backend/app/src/main/java/com/hostelmanagement/web/admin/AdminHostelController.java`

### 1.2 Booking reference + payment deadlines
- [ ] Add `booking_reference` and optional `expires_at` to bookings.
  - Migration: `backend/app/src/main/resources/db/migration/V8__booking_reference_and_expiry.sql`
  - Backend: `backend/app/src/main/java/com/hostelmanagement/domain/Booking.java`
- [ ] Ensure unique booking reference index.
  - Migration: same `V8__...sql`

### 1.3 Payment method and receipts
- [ ] Extend payments table for method/provider/receipt tracking.
  - Fields: `method`, `provider_reference`, `receipt_url`, `receipt_number`, `verified_by_admin`, `verified_at`
  - Migration: `backend/app/src/main/resources/db/migration/V9__payment_methods_and_receipts.sql`
- [ ] Extend payment domain enums and entity.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/domain/PaymentStatus.java`
  - Backend: `backend/app/src/main/java/com/hostelmanagement/domain/Payment.java`

---

## Phase 2 - Backend API Refactor for Student-Driven Selection

### 2.1 New request/response contracts
- [ ] Replace preference-only apply contract with explicit selection contract.
  - Current DTO to evolve: `backend/app/src/main/java/com/hostelmanagement/web/dto/ApplyRequest.java`
  - New required fields: `hostelId`, `roomId`, `hasAc`, `hasWifi`, `mattressType`, `specialRequests`
- [ ] Expand booking response for checkout UI.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/web/dto/BookingResponse.java`
  - Add: `bookingReference`, `paymentAmount`, `paymentDueAt`, `paymentStatus`

### 2.2 Student discovery endpoints (new)
- [ ] Add endpoint to list active hostels sorted by distance.
  - Suggested controller: `backend/app/src/main/java/com/hostelmanagement/web/student/StudentHostelController.java`
  - Route: `GET /api/student/hostels`
- [ ] Add endpoint to list available rooms per hostel.
  - Same controller route: `GET /api/student/hostels/{hostelId}/rooms`
  - Filter out full rooms (`currentOccupancy >= capacity`)

### 2.3 Booking apply flow update
- [ ] Enforce student-selected hostel and room.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/service/BookingService.java`
  - Remove automatic cross-hostel allocation path.
- [ ] Validate selected room belongs to selected hostel and matches student gender.
- [ ] Keep pessimistic lock + optimistic version safety on room selection.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/repository/RoomRepository.java`
- [ ] On successful hold, increment occupancy and set `PENDING_PAYMENT`.
- [ ] If room becomes full, status must become `FULL`.

### 2.4 Scheduler update
- [ ] Keep expiration job and make it use payment due deadline precisely.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/scheduler/BookingExpirationScheduler.java`
  - Backend: `backend/app/src/main/java/com/hostelmanagement/service/BookingService.java`
- [ ] On expiry: booking `EXPIRED`, decrement occupancy, reopen room if needed.

---

## Phase 3 - Payment Flows (Visa, MoMo, Cash)

### 3.1 Student payment endpoints (new)
- [ ] Add payment controller for student payment actions.
  - Suggested: `backend/app/src/main/java/com/hostelmanagement/web/student/StudentPaymentController.java`
- [ ] Add endpoints:
  - `POST /api/student/bookings/{bookingId}/pay/visa`
  - `POST /api/student/bookings/{bookingId}/pay/momo`
  - `POST /api/student/bookings/{bookingId}/pay/cash`
  - `GET /api/student/bookings/{bookingId}/receipt`

### 3.2 Payment service logic (new/expand)
- [ ] Create or expand payment service to process methods and state transitions.
  - Suggested: `backend/app/src/main/java/com/hostelmanagement/service/PaymentService.java`
  - Use repository: `backend/app/src/main/java/com/hostelmanagement/repository/PaymentRepository.java`
- [ ] Visa/MoMo success path:
  - set payment `SUCCESS`
  - set booking `APPROVED`
  - generate `receipt_number`
- [ ] Cash path:
  - receipt upload required
  - set payment `UNDER_REVIEW`
  - keep booking pending until admin verification policy is applied

### 3.3 Admin cash verification
- [ ] Add admin endpoint to verify/reject cash submissions.
  - Suggested controller extension: `backend/app/src/main/java/com/hostelmanagement/web/admin/AdminBookingController.java`
  - or new `AdminPaymentController.java`
- [ ] Verification rules:
  - Approve -> booking `APPROVED`
  - Reject -> booking `CANCELLED` or `EXPIRED` + release slot

---

## Phase 4 - Frontend Student Flow (Hostel -> Room -> Payment)

### 4.1 Service layer updates
- [ ] Replace admin-hostel API use in student flow with student discovery APIs.
  - Current file to change: `frontend/src/services/hostelService.js`
  - Add student functions: `listStudentHostels`, `listHostelRooms(hostelId)`
- [ ] Fix booking service naming/scope mismatch.
  - Current student apply is in `frontend/src/services/studentService.js`
  - Add explicit payload for `hostelId` + `roomId`
- [ ] Implement real payment service calls.
  - Replace placeholder logic in `frontend/src/services/paymentService.js`

### 4.2 Apply page refactor
- [ ] Refactor `frontend/src/pages/student/ApplyHostelPage.jsx` into two-step selection:
  1) choose hostel by distance
  2) choose room from available rooms in that hostel
- [ ] Ensure full rooms are visually disabled and unselectable.
- [ ] Show slots left and room preference metadata.
- [ ] Submit booking with selected room.

### 4.3 Booking and payments pages
- [ ] Update `frontend/src/pages/student/MyBookingPage.jsx` to include:
  - booking reference
  - countdown / due time state
  - direct payment method actions
- [ ] Update `frontend/src/pages/student/MyPaymentsPage.jsx` to include:
  - Visa/MoMo/Cash method selection
  - cash receipt upload
  - receipt/booking reference display

### 4.4 Routing and navigation
- [ ] Keep current route shell and wire new components if split by step.
  - Router: `frontend/src/App.jsx`
  - Layout: `frontend/src/components/layouts/StudentLayout.jsx`

---

## Phase 5 - Admin UI Updates

### 5.1 Hostel management
- [ ] Add/edit distance to campus in admin hostel form/list.
  - Frontend: `frontend/src/pages/admin/ManageHostelsPage.jsx`
  - Frontend service: `frontend/src/services/hostelService.js`

### 5.2 Payment verification
- [ ] Add cash verification queue actions.
  - Frontend: `frontend/src/pages/admin/ManagePaymentsPage.jsx`
  - Frontend service: `frontend/src/services/paymentService.js`
- [ ] Show payment method, receipt evidence, verification decision.

### 5.3 Booking/report visibility
- [ ] Show booking reference in admin bookings and reports.
  - Frontend: `frontend/src/pages/admin/ManageBookingsPage.jsx`
  - Frontend: `frontend/src/pages/admin/ViewReportsPage.jsx`

---

## Phase 6 - Security, Validation, and Error Contracts

### 6.1 Validation rules
- [ ] Block booking if room not available, wrong gender, wrong hostel mapping.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/service/BookingService.java`
- [ ] Validate payment actions only for booking owner (student).
  - Backend: student payment controller/service

### 6.2 CORS/Auth stability
- [x] CORS fixed for local frontend origin.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/config/CorsConfig.java`
  - Backend: `backend/app/src/main/resources/application.yml`
- [ ] Ensure all new student endpoints are protected by role.
  - Backend: `backend/app/src/main/java/com/hostelmanagement/security/SecurityConfig.java`

### 6.3 Global error messages
- [ ] Standardize errors for UI consumption (full room, payment timeout, invalid room).
  - Backend: `backend/app/src/main/java/com/hostelmanagement/web/exception/GlobalExceptionHandler.java`

---

## Phase 7 - Test Checklist (Mapped)

### 7.1 Backend unit/integration tests
- [ ] Add booking service tests for student-selected room path.
  - New tests: `backend/app/src/test/java/com/hostelmanagement/service/BookingServiceTest.java`
- [ ] Add payment service tests for Visa/MoMo success and cash review.
  - New tests: `backend/app/src/test/java/com/hostelmanagement/service/PaymentServiceTest.java`
- [ ] Add scheduler expiry test for occupancy decrement + status reset.
  - New tests: `backend/app/src/test/java/com/hostelmanagement/scheduler/BookingExpirationSchedulerTest.java`
- [ ] Keep existing auth tests green.
  - Existing: `backend/app/src/test/java/com/hostelmanagement/service/AuthServiceTest.java`

### 7.2 Frontend behavior tests (if introduced)
- [ ] Add component tests for hostel/room selection and disabled full rooms.
- [ ] Add payment flow tests for method switching and receipt upload.

---

## Phase 8 - Delivery Sequence (Recommended Sprint Order)

- [ ] Sprint 1: DB + backend discovery endpoints + booking contract refactor
- [ ] Sprint 2: frontend apply flow (hostel -> room) + booking page updates
- [ ] Sprint 3: payment API + frontend payment integration + receipts/booking reference
- [ ] Sprint 4: admin cash verification + reports + hardening/tests

---

## Done Definition (Project-Level)

- [ ] Student can select hostel by distance and then select an available room in that hostel.
- [ ] Full rooms are blocked in both API and UI.
- [ ] Booking hold expires correctly and releases slot.
- [ ] Visa/MoMo/Cash payment methods work as specified.
- [ ] Cash receipt upload and admin verification work end-to-end.
- [ ] Receipt + unique booking reference are available to student/admin.
- [ ] Core backend and frontend test coverage added for new flows.
