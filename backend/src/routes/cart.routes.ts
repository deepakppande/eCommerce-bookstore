import { Router } from 'express';
import { body, param } from 'express-validator';
import pool from '../db/pool';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { AuthRequest } from '../types/express.d';

export const cartRouter = Router();

async function getCart(userId: string) {
  const { rows } = await pool.query(`
    SELECT ci.quantity,
      json_build_object(
        'id', b.id, 'title', b.title, 'author', b.author, 'price', b.price::float,
        'stock', b.stock, 'coverImageUrl', b.cover_image_url,
        'tentativeDeliveryDays', b.tentative_delivery_days
      ) AS book
    FROM cart_items ci
    JOIN books b ON b.id = ci.book_id
    WHERE ci.user_id = $1
    ORDER BY ci.added_at
  `, [userId]);

  const items = rows.map((r: any) => ({
    book: r.book,
    quantity: r.quantity,
    subtotal: parseFloat(r.book.price) * r.quantity,
  }));
  const totalAmount = items.reduce((s: number, i: any) => s + i.subtotal, 0);
  return { items, totalItems: items.length, totalAmount };
}

// GET /cart
cartRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try { res.json(await getCart(req.userId!)); } catch (err) { next(err); }
});

// POST /cart
cartRouter.post('/', authenticate,
  body('bookId').isUUID(), body('quantity').isInt({ min: 1 }), validate,
  async (req: AuthRequest, res, next) => {
    try {
      const { bookId, quantity } = req.body;
      await pool.query(`
        INSERT INTO cart_items (user_id, book_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, book_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      `, [req.userId, bookId, quantity]);
      res.json(await getCart(req.userId!));
    } catch (err) { next(err); }
  },
);

// PATCH /cart/:bookId
cartRouter.patch('/:bookId', authenticate,
  param('bookId').isUUID(), body('quantity').isInt({ min: 1 }), validate,
  async (req: AuthRequest, res, next) => {
    try {
      await pool.query(
        `UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND book_id = $3`,
        [req.body.quantity, req.userId, req.params.bookId],
      );
      res.json(await getCart(req.userId!));
    } catch (err) { next(err); }
  },
);

// DELETE /cart/:bookId
cartRouter.delete('/:bookId', authenticate, param('bookId').isUUID(), validate,
  async (req: AuthRequest, res, next) => {
    try {
      await pool.query(`DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2`, [req.userId, req.params.bookId]);
      res.json(await getCart(req.userId!));
    } catch (err) { next(err); }
  },
);

// DELETE /cart
cartRouter.delete('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await pool.query(`DELETE FROM cart_items WHERE user_id = $1`, [req.userId]);
    res.sendStatus(204);
  } catch (err) { next(err); }
});
