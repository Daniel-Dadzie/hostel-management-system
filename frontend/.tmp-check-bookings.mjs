const login = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@university.edu', password: 'daniel123' })
});
const admin = await login.json();
console.log('admin-ok', login.status, admin.role);
const res = await fetch('http://localhost:8080/api/admin/bookings/paginated?page=0&size=50', {
  headers: { Authorization: `Bearer ${admin.accessToken}` }
});
const data = await res.json();
console.log('bookings', res.status, data.totalElements, JSON.stringify(data.content?.slice(0, 10).map((b) => ({ id: b.id, status: b.status, email: b.studentEmail, room: b.roomNumber, hostel: b.hostelName })), null, 2));
