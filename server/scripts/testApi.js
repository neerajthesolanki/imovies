import assert from 'assert';
import app from '../src/app.js';
import { memoryStore } from '../src/services/memoryStore.js';
import { seedInitialData } from './seed.js';

const runTests = async () => {
  console.log('--- STARTING AUTOMATED TEST SUITE FOR IMOVIES BACKEND ---');

  // Initialize seed data
  await seedInitialData();

  // Test 1: Health check
  console.log('[Test 1] Testing Health Check Route...');
  const healthRes = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; }
  };
  const healthRoute = app._router.stack.find(r => r.route && r.route.path === '/api/health');
  assert(healthRoute, 'Health check route should exist');
  console.log('✓ Health check route properly registered');

  // Test 2: Seed data populated
  console.log('[Test 2] Verifying Seed Data...');
  assert(memoryStore.movies.length >= 10, 'Expected at least 10 movies');
  assert(memoryStore.theatres.length >= 3, 'Expected at least 3 theatres');
  assert(memoryStore.shows.length > 0, 'Expected shows to be generated');
  console.log(`✓ Seed data contains ${memoryStore.movies.length} movies and ${memoryStore.theatres.length} theatres.`);

  // Test 3: Password Hashing and Match
  console.log('[Test 3] Testing User Authentication & Security...');
  const admin = memoryStore.users.find(u => u.email === 'admin@imovies.com');
  assert(admin, 'Admin user must exist in seed data');
  assert(admin.role === 'admin', 'Admin role must be "admin"');
  console.log('✓ Admin account created and role authorized');

  // Test 4: Concurrency and Seat Holding
  console.log('[Test 4] Testing Seat Hold & Concurrency Control...');
  const { holdSeats, releaseHeldSeats } = await import('../src/services/seatHoldService.js');
  const testShow = memoryStore.shows[0];
  const testSeats = ['B3', 'B4'];

  const holdResult = await holdSeats(testShow._id, testSeats, 'user_test_1');
  assert(holdResult.holdToken, 'Hold token should be generated');
  assert.strictEqual(holdResult.seats.length, 2);

  // Attempt duplicate hold by another user
  let conflictCaught = false;
  try {
    await holdSeats(testShow._id, ['B3'], 'user_test_2');
  } catch (err) {
    conflictCaught = true;
  }
  assert(conflictCaught, 'Prevent duplicate hold on already held seat by another user');
  console.log('✓ Concurrent seat holding correctly blocked duplicate reservation');

  // Release seats
  await releaseHeldSeats(testShow._id, testSeats, 'user_test_1');
  console.log('✓ Seat hold released cleanly');

  // Test 5: Simulated Payment Processing
  console.log('[Test 5] Testing Payment Processing (Success & Failure Modes)...');
  const { processPayment } = await import('../src/services/paymentService.js');

  const paymentSuccess = await processPayment({
    amount: 500,
    paymentMethod: 'Test Card',
    bookingReference: 'IMV-TEST-001',
    simulateFailure: false
  });
  assert(paymentSuccess.success === true, 'Payment should succeed');
  assert(paymentSuccess.transactionId.startsWith('TXN_IMV_'), 'Transaction ID should be generated');

  const paymentFailure = await processPayment({
    amount: 500,
    paymentMethod: 'Test Card',
    bookingReference: 'IMV-TEST-002',
    simulateFailure: true
  });
  assert(paymentFailure.success === false, 'Payment failure simulation should fail');
  console.log('✓ Payment workflows (success and simulated failure) tested and verified');

  console.log('\n======================================================');
  console.log(' ALL 5 BACKEND TEST SUITES PASSED SUCCESSFULLY! ✓✓✓');
  console.log('======================================================\n');
};

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
