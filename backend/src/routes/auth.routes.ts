import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';
import { validate } from '../middleware/validate.middleware';

export const authRouter = Router();

// POST /auth/register
authRouter.post(
  '/register',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      const hash = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [email, hash, firstName, lastName],
      );
      const user = rows[0];
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
      });
      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, giftPoints: user.gift_points },
      });
    } catch (err: any) {
      if (err.code === '23505') {
        res.status(409).json({ code: 'CONFLICT', message: 'Email already registered' });
      } else {
        next(err);
      }
    }
  },
);

// POST /auth/login
authRouter.post(
  '/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        return;
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
      });
      res.json({
        token,
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, giftPoints: user.gift_points },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /auth/logout  (stateless JWT — client discards token)
authRouter.post('/logout', (_req, res) => res.sendStatus(204));
