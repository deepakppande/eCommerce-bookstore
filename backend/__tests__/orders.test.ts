import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db/pool';

let token: string;
let orderId: string;

beforeAll(async () => {
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'demo@bookstore.com', password: 'Password1!',
  });
  token = res.body.token;
});

afterAll(async () => { await pool.end(); });

describe('Orders API', () => {
  it('GET /orders returns array', async () => {
    const res = await request(app).get('/api/v1/orders').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /orders with empty cart returns 422', async () => {
    // Ensure cart is empty
    await request(app).delete('/api/v1/cart').set('Authorization', `Bearer ${token}`);
    const addresses = await request(app).get('/api/v1/users/me/addresses').set('Authorization', `Bearer ${token}`);
    const addressId = addresses.body[0]?.id ?? '00000000-0000-0000-0000-000000000001';
    const res = await request(app).post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ addressId });
    expect(res.status).toBe(422);
  });
});

describe('Payments API', () => {
  it('POST /payments returns 404 for unknown order', async () => {
    const res = await request(app).post('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderId: '00000000-0000-0000-0000-000000000000', method: 'card' });
    expect(res.status).toBe(404);
  });
});
