import SockJS from 'sockjs-client';
import * as StompModule from 'stompjs';

const API = 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@university.edu';
const ADMIN_PASSWORD = 'daniel123';
const STUDENT_PASSWORD = 'Passw0rd1!';
const uniqueSuffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const studentEmail = `wsprobe.${uniqueSuffix}@test.com`;

async function api(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = text;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${path}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

async function login(email, password) {
  const data = await api('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return data.accessToken || data.token;
}

async function main() {
  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);

  const context = await api('/api/admin/rollover/context', { token: adminToken });
  const originalStartDate = context.startDate;
  const originalReapplicationOpenDate = context.reapplicationOpenDate;
  const temporaryStartDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await api(`/api/admin/rollover/terms/${context.activeTermId}`, {
    method: 'PUT',
    token: adminToken,
    body: {
      academicYear: context.academicYear,
      semester: context.semester,
      startDate: temporaryStartDate,
      endDate: context.endDate,
      reapplicationOpenDate: temporaryStartDate,
      active: true,
    },
  });

  try {
    const registered = await api('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'WS Probe Student',
        email: studentEmail,
        phone: '+233555000001',
        gender: 'MALE',
        profileImagePath: '',
        password: STUDENT_PASSWORD,
      },
    });

    const studentToken = registered.accessToken || registered.token || await login(studentEmail, STUDENT_PASSWORD);
    const tokenPayload = JSON.parse(Buffer.from(studentToken.split('.')[1], 'base64url').toString('utf8'));
    const studentSubjectId = tokenPayload?.sub;

    const hostels = await api('/api/student/hostels', { token: studentToken });
    const hostel = hostels[0];
    const rooms = await api(`/api/student/hostels/${hostel.id}/rooms`, { token: studentToken });
    const room = rooms[0];

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
        specialRequests: 'ws probe booking',
      },
    });

    const stompFactory = StompModule?.default ?? StompModule?.Stomp ?? StompModule;
    const socket = new SockJS(`${API}/ws-notifications`);
    const client = stompFactory.over(socket);
    client.debug = null;

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('No websocket message received in time')), 15000);

      client.connect(
        { Authorization: `Bearer ${studentToken}` },
        () => {
          const onMessage = (message) => {
            clearTimeout(timeout);
            console.log('WS_MESSAGE', message.body);
            client.disconnect(() => resolve());
          };

          client.subscribe('/user/queue/notifications', onMessage);
          if (studentSubjectId) {
            client.subscribe(`/topic/students/${studentSubjectId}/notifications`, onMessage);
          }

          setTimeout(() => {
            api(`/api/admin/bookings/${booking.id}/status`, {
              method: 'PATCH',
              token: adminToken,
              body: { status: 'APPROVED' },
            }).then(() => {
              console.log('BOOKING_APPROVED', booking.id);
            }).catch(reject);
          }, 1200);
        },
        reject
      );
    });
  } finally {
    await api(`/api/admin/rollover/terms/${context.activeTermId}`, {
      method: 'PUT',
      token: adminToken,
      body: {
        academicYear: context.academicYear,
        semester: context.semester,
        startDate: originalStartDate,
        endDate: context.endDate,
        reapplicationOpenDate: originalReapplicationOpenDate,
        active: true,
      },
    });
  }
}

main().catch((err) => {
  console.error('WS_PROBE_FAILED');
  console.error(err?.stack || err?.message || err);
  process.exit(1);
});
