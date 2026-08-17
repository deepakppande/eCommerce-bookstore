import { Router } from 'express';
import { body, param } from 'express-validator';
import pool from '../db/pool';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { AuthRequest } from '../types/express.d';

export const usersRouter = Router();

// GET /users/me
usersRouter.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.userId]);
    const u = rows[0];
    res.json({ id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, giftPoints: u.gift_points });
  } catch (err) { next(err); }
});

// PATCH /users/me
usersRouter.patch('/me', authenticate, body('firstName').optional(), body('lastName').optional(), validate,
  async (req: AuthRequest, res, next) => {
    try {
      const { firstName, lastName } = req.body;
      const { rows } = await pool.query(
        `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), updated_at = NOW()
         WHERE id = $3 RETURNING *`,
        [firstName, lastName, req.userId],
      );
      const u = rows[0];
      res.json({ id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, giftPoints: u.gift_points });
    } catch (err) { next(err); }
  },
);

// GET /users/me/addresses
usersRouter.get('/me/addresses', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC`, [req.userId]);
    res.json(rows.map(toAddress));
  } catch (err) { next(err); }
});

// POST /users/me/addresses
usersRouter.post('/me/addresses', authenticate,
  body('label').notEmpty(), body('line1').notEmpty(),
  body('city').notEmpty(), body('state').notEmpty(),
  body('postalCode').notEmpty(), body('country').notEmpty(),
  validate,
  async (req: AuthRequest, res, next) => {
    try {
      const { label, line1, line2, city, state, postalCode, country, isDefault } = req.body;
      if (isDefault) {
        await pool.query(`UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, [req.userId]);
      }
      const { rows } = await pool.query(
        `INSERT INTO addresses (user_id, label, line1, line2, city, state, postal_code, country, is_default)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [req.userId, label, line1, line2 ?? null, city, state, postalCode, country, isDefault ?? false],
      );
      res.status(201).json(toAddress(rows[0]));
    } catch (err) { next(err); }
  },
);

// PATCH /users/me/addresses/:addressId
usersRouter.patch('/me/addresses/:addressId', authenticate, param('addressId').isUUID(), validate,
  async (req: AuthRequest, res, next) => {
    try {
      const { label, line1, line2, city, state, postalCode, country, isDefault } = req.body;
      if (isDefault) {
        await pool.query(`UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, [req.userId]);
      }
      const { rows } = await pool.query(
        `UPDATE addresses SET
           label = COALESCE($1, label), line1 = COALESCE($2, line1), line2 = COALESCE($3, line2),
           city = COALESCE($4, city), state = COALESCE($5, state), postal_code = COALESCE($6, postal_code),
           country = COALESCE($7, country), is_default = COALESCE($8, is_default)
         WHERE id = $9 AND user_id = $10 RETURNING *`,
        [label, line1, line2, city, state, postalCode, country, isDefault, req.params.addressId, req.userId],
      );
      if (!rows[0]) { res.status(404).json({ code: 'NOT_FOUND', message: 'Address not found' }); return; }
      res.json(toAddress(rows[0]));
    } catch (err) { next(err); }
  },
);

// DELETE /users/me/addresses/:addressId
usersRouter.delete('/me/addresses/:addressId', authenticate, param('addressId').isUUID(), validate,
  async (req: AuthRequest, res, next) => {
    try {
      await pool.query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2`, [req.params.addressId, req.userId]);
      res.sendStatus(204);
    } catch (err) { next(err); }
  },
);

function toAddress(r: any) {
  return {
    id: r.id, label: r.label, line1: r.line1, line2: r.line2,
    city: r.city, state: r.state, postalCode: r.postal_code,
    country: r.country, isDefault: r.is_default,
  };
}
