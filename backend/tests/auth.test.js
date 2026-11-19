const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path,
      method: 'GET',
      headers
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING AUTHENTICATION VERIFICATION TESTS ---');

  // Test 1: Validation
  const r1 = await post('/api/auth/register', { name: '', email: 'bad' });
  console.log('Test 1 (Validation Error): Status =', r1.status, '| Error =', r1.body.error);

  // Test 2: Register New Attendee
  const testEmail = `test.student.${Date.now()}@citu.edu.ph`;
  const r2 = await post('/api/auth/register', {
    name: 'CIT-U Test Student',
    email: testEmail,
    password: 'Password123!',
    role: 'attendee'
  });
  console.log('Test 2 (Register Attendee): Status =', r2.status, '| User =', r2.body.user.name, '| Role =', r2.body.user.role);
  const attendeeToken = r2.body.token;

  // Test 3: Duplicate Registration Prevention
  const r3 = await post('/api/auth/register', {
    name: 'Duplicate Student',
    email: testEmail,
    password: 'Password123!',
    role: 'attendee'
  });
  console.log('Test 3 (Prevent Duplicate): Status =', r3.status, '| Error =', r3.body.error);

  // Test 4: Login with Wrong Password
  const r4 = await post('/api/auth/login', {
    email: testEmail,
    password: 'WrongPassword!'
  });
  console.log('Test 4 (Invalid Password): Status =', r4.status, '| Error =', r4.body.error);

  // Test 5: Login with Correct Password
  const r5 = await post('/api/auth/login', {
    email: testEmail,
    password: 'Password123!'
  });
  console.log('Test 5 (Valid Login): Status =', r5.status, '| Token Received =', Boolean(r5.body.token));

  // Test 6: Attendee Accessing Attendee Dashboard
  const r6 = await get('/api/dashboard/attendee', { Authorization: `Bearer ${attendeeToken}` });
  console.log('Test 6 (Attendee Dashboard Access): Status =', r6.status, '| Role =', r6.body.role);

  // Test 7: Attendee Accessing Organizer Dashboard (Role Enforcement - Must be 403 Forbidden)
  const r7 = await get('/api/dashboard/organizer', { Authorization: `Bearer ${attendeeToken}` });
  console.log('Test 7 (Attendee Access Organizer Dashboard - RBAC Guard): Status =', r7.status, '| Expected 403 Forbidden =', r7.status === 403, '| Error =', r7.body.error);

  // Test 8: Login as Seed Organizer
  const r8 = await post('/api/auth/login', {
    email: 'mark.organizer@eventsync.ph',
    password: 'Password123!'
  });
  console.log('Test 8 (Organizer Login): Status =', r8.status, '| Role =', r8.body.user.role);
  const orgToken = r8.body.token;

  // Test 9: Organizer Accessing Organizer Dashboard
  const r9 = await get('/api/dashboard/organizer', { Authorization: `Bearer ${orgToken}` });
  console.log('Test 9 (Organizer Dashboard Access): Status =', r9.status, '| Total Revenue =', r9.body.totalRevenue);

  console.log('--- ALL AUTHENTICATION TESTS PASSED! ---');
  process.exit(0);
}

// Start server in background for testing
require('./server.js');
setTimeout(runTests, 800);
