import { Router } from 'express';
import { body, param } from 'express-validator';
import pool from '../db/pool';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { AuthRequest } from '../types/express.d';

export const ordersRouter = Router();

// GET /orders
ordersRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC`,
      [req.userId],
    );
    res.json(rows.map(toOrder));
  } catch (err) { next(err); }
});

// POST /orders  — place order from cart
ordersRouter.post('/', authenticate,
  body('addressId').isUUID(),
  body('giftPointsToRedeem').optional().isInt({ min: 0 }),
  validate,
  async (req: AuthRequest, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { addressId, giftPointsToRedeem = 0 } = req.body;

      // Fetch cart items
      const { rows: cartItems } = await client.query(`
        SELECT ci.quantity, b.price, b.id AS book_id, b.stock
        FROM cart_items ci JOIN books b ON b.id = ci.book_id
        WHERE ci.user_id = $1
      `, [req.userId]);

      if (cartItems.length === 0) {
        await client.query('ROLLBACK');
        res.status(422).json({ code: 'VALIDATION_ERROR', message: 'Cart is empty' });
        return;
      }

      // Validate stock
      for (const item of cartItems) {
        if (item.stock < item.quantity) {
          await client.query('ROLLBACK');
          res.status(422).json({ code: 'VALIDATION_ERROR', message: `Insufficient stock for book ${item.book_id}` });
          return;
        }
      }

      const subtotal = cartItems.reduce((s: number, i: any) => s + parseFloat(i.price) * i.quantity, 0);

      // Validate gift points
      const { rows: userRows } = await client.query(`SELECT gift_points FROM users WHERE id = $1`, [req.userId]);
      const available = userRows[0].gift_points;
      const pointsUsed = Math.min(giftPointsToRedeem, available, Math.floor(subtotal));
      const totalAmount = Math.max(0, subtotal - pointsUsed);

      const cancelDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

      // Create order
      const { rows: orderRows } = await client.query(`
        INSERT INTO orders (user_id, address_id, status, total_amount, gift_points_used, cancel_deadline)
        VALUES ($1, $2, 'pending', $3, $4, $5) RETURNING *
      `, [req.userId, addressId, totalAmount, pointsUsed, cancelDeadline]);
      const order = orderRows[0];

      // Create order items & decrement stock
      for (const item of cartItems) {
        await client.query(
          `INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES ($1,$2,$3,$4)`,
          [order.id, item.book_id, item.quantity, item.price],
        );
        await client.query(`UPDATE books SET stock = stock - $1 WHERE id = $2`, [item.quantity, item.book_id]);
      }

      // Deduct gift points
      if (pointsUsed > 0) {
        await client.query(`UPDATE users SET gift_points = gift_points - $1 WHERE id = $2`, [pointsUsed, req.userId]);
      }

      // Clear cart
      await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [req.userId]);

      await client.query('COMMIT');
      res.status(201).json(toOrder(order));
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  },
);

// GET /orders/:orderId
ordersRouter.get('/:orderId', authenticate, param('orderId').isUUID(), validate,
  async (req: AuthRequest, res, next) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1 AND user_id = $2`, [req.params.orderId, req.userId]);
      if (!rows[0]) { res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found' }); return; }
      const order = rows[0];

      const { rows: items } = await pool.query(`
        SELECT oi.*, json_build_object('id',b.id,'title',b.title,'author',b.author,'coverImageUrl',b.cover_image_url) AS book
        FROM order_items oi JOIN books b ON b.id = oi.book_id
        WHERE oi.order_id = $1
      `, [order.id]);

      const { rows: addrRows } = await pool.query(`SELECT * FROM addresses WHERE id = $1`, [order.address_id]);
      const { rows: payRows } = await pool.query(`SELECT * FROM payments WHERE order_id = $1`, [order.id]);

      res.json({
        ...toOrder(order),
        items: items.map((i: any) => ({ book: i.book, quantity: i.quantity, unitPrice: parseFloat(i.unit_price) })),
        address: addrRows[0] ? toAddress(addrRows[0]) : null,
        payment: payRows[0] ? toPayment(payRows[0]) : null,
      });
    } catch (err) { next(err); }
  },
);

// POST /orders/:orderId/cancel
ordersRouter.post('/:orderId/cancel', authenticate, param('orderId').isUUID(), validate,
  async (req: AuthRequest, res, next) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1 AND user_id = $2`, [req.params.orderId, req.userId]);
      if (!rows[0]) { res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found' }); return; }
      const order = rows[0];
      if (order.status === 'cancelled') { res.status(409).json({ code: 'CONFLICT', message: 'Already cancelled' }); return; }
      if (order.cancel_deadline && new Date() > new Date(order.cancel_deadline)) {
        res.status(409).json({ code: 'CONFLICT', message: 'Cancellation window has passed' });
        return;
      }
      const { rows: updated } = await pool.query(
        `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [order.id],
      );
      // Restore gift points if used
      if (order.gift_points_used > 0) {
        await pool.query(`UPDATE users SET gift_points = gift_points + $1 WHERE id = $2`, [order.gift_points_used, req.userId]);
      }
      res.json(toOrder(updated[0]));
    } catch (err) { next(err); }
  },
);

function toOrder(r: any) {
  return {
    id: r.id, status: r.status,
    totalAmount: parseFloat(r.total_amount),
    giftPointsUsed: r.gift_points_used,
    placedAt: r.placed_at,
    cancelDeadline: r.cancel_deadline,
  };
}

function toAddress(r: any) {
  return { id: r.id, label: r.label, line1: r.line1, line2: r.line2, city: r.city, state: r.state, postalCode: r.postal_code, country: r.country, isDefault: r.is_default };
}

function toPayment(r: any) {
  return { id: r.id, orderId: r.order_id, method: r.method, status: r.status, confirmationRef: r.confirmation_ref, amount: parseFloat(r.amount), paidAt: r.paid_at };
}
