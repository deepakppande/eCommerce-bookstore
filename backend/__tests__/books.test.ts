import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db/pool';

afterAll(async () => { await pool.end(); });

describe('Books API', () => {
  it('GET /books returns paginated list', async () => {
    const res = await request(app).get('/api/v1/books');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.total).toBe('number');
  });

  it('GET /books?q= filters by title/author', async () => {
    const res = await request(app).get('/api/v1/books?q=code');
    expect(res.status).toBe(200);
  });

  it('GET /books/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/v1/books/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('GET /categories returns array', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /brands returns array', async () => {
    const res = await request(app).get('/api/v1/brands');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
