import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db/pool';

const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PW = 'Password1!';

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
  await pool.end();
});

describe('POST /api/v1/auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: TEST_EMAIL, password: TEST_PW, firstName: 'Test', lastName: 'User',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(TEST_EMAIL);
  });

  it('rejects duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: TEST_EMAIL, password: TEST_PW, firstName: 'Test', lastName: 'User',
    });
    expect(res.status).toBe(409);
  });

  it('rejects weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'other@example.com', password: 'short', firstName: 'A', lastName: 'B',
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns token on valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: TEST_EMAIL, password: TEST_PW });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: TEST_EMAIL, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });
});
