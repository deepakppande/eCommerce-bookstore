import { Router } from 'express';
import pool from '../db/pool';

export const brandsRouter = Router();

brandsRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM brands ORDER BY name`);
    res.json(rows.map((r: any) => ({ id: r.id, name: r.name, slug: r.slug })));
  } catch (err) { next(err); }
});
