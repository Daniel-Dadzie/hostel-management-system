import { chromium } from 'playwright';

const API_BASE = 'http://localhost:8080';
const UI_BASE = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@university.edu';
const ADMIN_PASSWORD_CANDIDATES = ['daniel123', 'changeme123'];
const STUDENT_PASSWORD = 'Passw0rd1!';
const uniqueSuffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const studentEmail = `smoke.${uniqueSuffix}@test.com`;

async function api(path, { method = 'GET', token, body, headers = {} } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = text;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // keep raw text
  }

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    throw new Error(`HTTP ${response.status} ${path}: ${message}`);
  }

  return payload;
}

async function login(email, password) {
  const data = await api('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  return data.accessToken || data.token;
}

async function main() {
  let adminToken = null;
  for (const password of ADMIN_PASSWORD_CANDIDATES) {
    try {
      adminToken = await login(ADMIN_EMAIL, password);
      console.log(`admin-login-ok:${password}`);
      break;
    } catch (error) {
      console.log(`admin-login-failed:${password}`);
    }
  }

  if (!adminToken) {
    throw new Error('Unable to log in as admin with known passwords');
  }

  const rolloverContext = await api('/api/admin/rollover/context', { token: adminToken });
  const originalStartDate = rolloverContext.startDate;
  const originalReapplicationOpenDate = rolloverContext.reapplicationOpenDate;
  const temporaryStartDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await api(`/api/admin/rollover/terms/${rolloverContext.activeTermId}`, {
    method: 'PUT',
    token: adminToken,
    body: {
      academicYear: rolloverContext.academicYear,
      semester: rolloverContext.semester,
      startDate: temporaryStartDate,
      endDate: rolloverContext.endDate,
      reapplicationOpenDate: temporaryStartDate,
      active: true,
    },
  });

  try {
    const registered = await api('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Smoke Test Student',
        email: studentEmail,
        phone: '+233555000000',
        gender: 'MALE',
        profileImagePath: '',
        password: STUDENT_PASSWORD,
      },
    });
    const studentToken = registered.accessToken || registered.token || await login(studentEmail, STUDENT_PASSWORD);
    console.log(`student-login-ok:${studentEmail}`);

    const hostels = await api('/api/student/hostels', { token: studentToken });
    if (!Array.isArray(hostels) || hostels.length === 0) {
      throw new Error('No active hostels available');
    }

    let selection = null;
    for (const hostel of hostels) {
      const rooms = await api(`/api/student/hostels/${hostel.id}/rooms`, { token: studentToken });
      const room = Array.isArray(rooms) ? rooms[0] : null;
      if (room) {
        selection = { hostel, room };
        break;
      }
    }

    if (!selection) {
      throw new Error('No available rooms found');
    }

    const { hostel, room } = selection;
    const booking = await api('/api/student/apply', {
      method: 'POST',
      token: studentToken,
      body: {
        hostelId: hostel.id,
        floorNumber: room.floorNumber,
        roomId: room.id,
        hasAc: room.hasAc,
        hasWifi: room.hasWifi,
        mattressType: room.mattressType,
        specialRequests: 'Playwright smoke test booking',
      },
    });

    const bookingId = booking.id;
    console.log(`booking-created:${bookingId}:${booking.status}:${booking.paymentStatus}`);

    const browser = await chromium.launch({ headless: true });
    const studentContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });

    await studentContext.addInitScript(({ token, role }) => {
      localStorage.setItem('hms.token', token);
      localStorage.setItem('hms.role', role);
    }, { token: studentToken, role: 'STUDENT' });

    await adminContext.addInitScript(({ token, role }) => {
      localStorage.setItem('hms.token', token);
      localStorage.setItem('hms.role', role);
    }, { token: adminToken, role: 'ADMIN' });

    const studentPage = await studentContext.newPage();
    const adminPage = await adminContext.newPage();

    const studentLogs = [];
    studentPage.on('console', (message) => {
      const text = message.text();
      studentLogs.push(text);
      if (text.includes('[Notification]') || text.includes('[WebSocket]')) {
        console.log(`student-console:${text}`);
      }
    });

    await studentPage.goto(`${UI_BASE}/student/dashboard`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForLoadState('networkidle');
    await studentPage.locator('body').waitFor({ state: 'visible', timeout: 30000 });
    await studentPage.waitForTimeout(3000);

    await adminPage.goto(`${UI_BASE}/admin/bookings`, { waitUntil: 'domcontentloaded' });
    await api(`/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: { status: 'APPROVED' },
    });
    console.log(`booking-approved:${bookingId}`);

    const paymentTitle = studentPage.getByText('Payment Approved', { exact: false });
    const paymentMessage = studentPage.getByText('Your payment has been approved. Your room allocation is confirmed!', { exact: false });
    const bookingTitle = studentPage.getByText('Booking Approved', { exact: false });
    const bookingMessage = studentPage.getByText('Your booking has been approved by the admin.', { exact: false });

    await Promise.any([
      paymentTitle.waitFor({ state: 'visible', timeout: 20000 }),
      paymentMessage.waitFor({ state: 'visible', timeout: 20000 }),
      bookingTitle.waitFor({ state: 'visible', timeout: 20000 }),
      bookingMessage.waitFor({ state: 'visible', timeout: 20000 }),
    ]);

    console.log('toast-visible:true');
    console.log(JSON.stringify({ studentEmail, bookingId, hostels: hostels.length, logs: studentLogs.slice(-10) }, null, 2));

    await browser.close();
  } finally {
    await api(`/api/admin/rollover/terms/${rolloverContext.activeTermId}`, {
      method: 'PUT',
      token: adminToken,
      body: {
        academicYear: rolloverContext.academicYear,
        semester: rolloverContext.semester,
        startDate: originalStartDate,
        endDate: rolloverContext.endDate,
        reapplicationOpenDate: originalReapplicationOpenDate,
        active: true,
      },
    }).catch((error) => {
      console.error('restore-failed', error?.message || error);
    });
  }
}

main().catch((error) => {
  console.error('SMOKE_TEST_FAILED');
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
