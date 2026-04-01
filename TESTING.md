# Testing Guide

This document explains how to run tests, understand the test structure, and write new tests for the Hostel Management System.

---

## Test Structure

```
hostel-management-system/
├── backend/app/src/test/
│   ├── java/com/hostelmanagement/
│   │   ├── service/
│   │   │   ├── AuthServiceTest.java              # Unit: registration, login, password reset
│   │   │   ├── BookingServiceTest.java            # Unit: booking business logic
│   │   │   ├── NotificationServiceTest.java       # Unit: email notification dispatch
│   │   │   └── StudentPaymentServiceTest.java     # Unit: Paystack webhook handling
│   │   └── integration/
│   │       ├── BookingServiceIntegrationTest.java # Integration: full booking lifecycle
│   │       └── PasswordResetIntegrationTest.java  # Integration: password reset flow
│   └── resources/
│       └── application-test.yml                  # H2 in-memory DB config for tests
│
└── frontend/src/test/
    ├── setup.js                                  # Global test setup (mocks, DOM helpers)
    ├── authFlow.test.jsx                         # Integration: login/register flows
    ├── components.test.jsx                       # Unit: Modal, ProtectedRoute, PublicRoute
    └── hooks.test.js                             # Unit: useCountdown, useMutationWithOptimisticUpdate
```

---

## Running Tests Locally

### Backend

```bash
cd backend/app

# Run all tests
./mvnw test

# Run all tests with coverage report (outputs to target/site/jacoco/)
# Note: -Pcoverage activates the JaCoCo profile; the base surefire config already
# includes -Dnet.bytebuddy.experimental=true which is required because Mockito's
# byte-manipulation library (ByteBuddy) needs experimental mode on recent JDK builds
# to generate proxy classes for final types and record classes.
./mvnw verify -Pcoverage

# Run a specific test class
./mvnw test -Dtest=BookingServiceTest

# Run a specific test method
./mvnw test -Dtest=BookingServiceTest#apply_shouldCreateBookingAndPaymentSuccessfully

# Run only integration tests
./mvnw test -Dtest="*IntegrationTest"
```

### Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Run all tests once
npm test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report (outputs to coverage/)
npm run test:coverage
```

---

## CI/CD Pipelines

Three GitHub Actions workflows run on every PR and push to `main`:

| Workflow | File | Trigger |
|---|---|---|
| CI Status (combined) | `.github/workflows/ci-status.yml` | All pushes and PRs to `main` |
| Backend Tests | `.github/workflows/backend-tests.yml` | Changes under `backend/` |
| Frontend Tests | `.github/workflows/frontend-tests.yml` | Changes under `frontend/` |

The `ci-status.yml` workflow aggregates results from both backend and frontend jobs.
A PR cannot be considered "green" unless all jobs pass.

---

## Backend Test Conventions

### Unit Tests (`@ExtendWith(MockitoExtension.class)`)

- Use Mockito to mock all dependencies.
- Follow the **Given / When / Then** structure.
- Each `@Test` method tests one logical scenario.
- Use `assertThat(…)` from AssertJ for readable assertions.
- Use `assertThatThrownBy(…)` to verify exception messages precisely.

```java
@Test
void apply_shouldThrowWhenRoomIsFull() {
    // Given
    Room room = makeRoom(/* capacity=1, occupancy=1 */);
    when(roomRepository.findByIdForUpdate(ROOM_ID)).thenReturn(room);

    // When / Then
    assertThatThrownBy(() -> bookingService.apply(STUDENT_ID, request))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("room is full or unavailable");
}
```

### Integration Tests (`@SpringBootTest @ActiveProfiles("test")`)

- Use `@ActiveProfiles("test")` to load `application-test.yml` (H2 in-memory DB).
- Use `@MockBean` for services that require external resources (e.g., `NotificationService`).
- Use `@Transactional` to roll back database changes after each test.
- Test the full service stack (service → repository → database).

```java
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BookingServiceIntegrationTest {

    @MockBean
    private NotificationService notificationService; // No SMTP needed in tests

    @Test
    void apply_shouldCreateBookingAndPendingPayment() {
        // create real DB objects, call service, assert on DB state
    }
}
```

---

## Frontend Test Conventions

### Component Tests

- Use `@testing-library/react` with `jsdom` environment.
- Prefer queries that reflect how a user finds elements (`getByRole`, `getByLabelText`).
- Use `userEvent` (from `@testing-library/user-event`) for realistic user interactions.
- Wrap components in their required providers (`QueryClientProvider`, `AuthProvider`, `MemoryRouter`).

```jsx
it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Test">content</Modal>);

    await userEvent.click(screen.getByLabelText('Close modal'));

    expect(onClose).toHaveBeenCalledTimes(1);
});
```

### Hook Tests

- Use `renderHook` from `@testing-library/react`.
- Use `vi.useFakeTimers()` for time-dependent hooks like `useCountdown`.
- Always call `vi.useRealTimers()` in `afterEach` to clean up fake timers.

```js
it('counts down over time', async () => {
    vi.useFakeTimers();
    const future = new Date(Date.now() + 10_000).toISOString();
    const { result } = renderHook(() => useCountdown(future));

    act(() => { vi.advanceTimersByTime(2_000); });

    expect(result.current.remaining).toBeLessThanOrEqual(8);
    vi.useRealTimers();
});
```

---

## Coverage Goals

| Layer | Target | Critical paths |
|---|---|---|
| Backend service layer | ≥ 80% | BookingService, AuthService, StudentPaymentService |
| Frontend components | ≥ 70% | LoginPage, RegisterPage, ProtectedRoute |
| Frontend hooks | ≥ 70% | useCountdown, useApi, useOptimisticMutation |

Coverage reports are uploaded to [Codecov](https://codecov.io) on every CI run.

---

## Writing New Tests

1. **Backend unit test**: Create a class in `src/test/java/com/hostelmanagement/service/`, extend `@ExtendWith(MockitoExtension.class)`, mock dependencies, and test one scenario per `@Test` method.

2. **Backend integration test**: Create a class in `src/test/java/com/hostelmanagement/integration/`, annotate with `@SpringBootTest @ActiveProfiles("test") @Transactional`, and use real repositories against the H2 database.

3. **Frontend test**: Create a `*.test.jsx` or `*.test.js` file under `src/test/` (or co-located with the component). Add `@vitest-environment jsdom` if needed, and use Testing Library helpers.

4. **New test helpers**: Reuse existing factory helpers (e.g., `makeStudent`, `makeRoom` in `BookingServiceTest`) rather than duplicating setup code.
