import { Router } from 'express';
import { body, param } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/pool';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { AuthRequest } from '../types/express.d';

export const paymentsRouter = Router();

// POST /payments
paymentsRouter.post('/', authenticate,
  body('orderId').isUUID(),
  body('method').isIn(['card', 'paypal', 'gift_points']),
  validate,
  async (req: AuthRequest, res, next) => {
    try {
      const { orderId, method } = req.body;
      const { rows: orderRows } = await pool.query(
        `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
        [orderId, req.userId],
      );
      if (!orderRows[0]) { res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found' }); return; }
      const order = orderRows[0];
      if (order.status !== 'pending') {
        res.status(409).json({ code: 'CONFLICT', message: 'Order is not in pending state' });
        return;
      }

      // Simulate payment gateway — always succeeds in dev
      const confirmationRef = `REF-${uuidv4().slice(0, 8).toUpperCase()}`;

      const { rows } = await pool.query(`
        INSERT INTO payments (order_id, method, status, confirmation_ref, amount, paid_at)
        VALUES ($1, $2, 'completed', $3, $4, NOW()) RETURNING *
      `, [orderId, method, confirmationRef, order.total_amount]);

      // Update order status
      await pool.query(`UPDATE orders SET status = 'confirmed', updated_at = NOW() WHERE id = $1`, [orderId]);

      const p = rows[0];
      res.status(201).json({
        id: p.id, orderId: p.order_id, method: p.method, status: p.status,
        confirmationRef: p.confirmation_ref, amount: parseFloat(p.amount), paidAt: p.paid_at,
      });
    } catch (err) { next(err); }
  },
);

// GET /payments/:paymentId
paymentsRouter.get('/:paymentId', authenticate, param('paymentId').isUUID(), validate,
  async (req: AuthRequest, res, next) => {
    try {
      const { rows } = await pool.query(`
        SELECT p.* FROM payments p
        JOIN orders o ON o.id = p.order_id
        WHERE p.id = $1 AND o.user_id = $2
      `, [req.params.paymentId, req.userId]);
      if (!rows[0]) { res.status(404).json({ code: 'NOT_FOUND', message: 'Payment not found' }); return; }
      const p = rows[0];
      res.json({ id: p.id, orderId: p.order_id, method: p.method, status: p.status, confirmationRef: p.confirmation_ref, amount: parseFloat(p.amount), paidAt: p.paid_at });
    } catch (err) { next(err); }
  },
);
