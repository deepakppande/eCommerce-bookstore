import { Router } from 'express';
import pool from '../db/pool';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM categories ORDER BY name`);
    res.json(rows.map((r: any) => ({ id: r.id, name: r.name, slug: r.slug, description: r.description })));
  } catch (err) { next(err); }
});
