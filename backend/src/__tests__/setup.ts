// Load test environment variables before any test runs
process.env.DATABASE_URL =
  'postgresql://welltrack:welltrack_dev@localhost:5432/welltrack_dev';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.PORT = '0'; // OS assigns a free port
