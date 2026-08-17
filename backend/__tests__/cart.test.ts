import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db/pool';

let token: string;
let bookId: string;

beforeAll(async () => {
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'demo@bookstore.com', password: 'Password1!',
  });
  token = loginRes.body.token;
  const booksRes = await request(app).get('/api/v1/books?limit=1');
  bookId = booksRes.body.data[0]?.id;
});

afterAll(async () => {
  if (token) await request(app).delete('/api/v1/cart').set('Authorization', `Bearer ${token}`);
  await pool.end();
});

describe('Cart API', () => {
  it('GET /cart returns empty or populated cart', async () => {
    const res = await request(app).get('/api/v1/cart').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('POST /cart adds an item', async () => {
    if (!bookId) return;
    const res = await request(app).post('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId, quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('PATCH /cart/:bookId updates quantity', async () => {
    if (!bookId) return;
    const res = await request(app).patch(`/api/v1/cart/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 });
    expect(res.status).toBe(200);
  });

  it('DELETE /cart/:bookId removes item', async () => {
    if (!bookId) return;
    const res = await request(app).delete(`/api/v1/cart/${bookId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.status).toBe(401);
  });
});
