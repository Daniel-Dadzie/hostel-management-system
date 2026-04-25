const login = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@university.edu', password: 'daniel123' }),
});
const admin = await login.json();
const response = await fetch('http://localhost:8080/api/admin/rollover/context', {
  headers: { Authorization: `Bearer ${admin.accessToken}` },
});
console.log(JSON.stringify(await response.json(), null, 2));
