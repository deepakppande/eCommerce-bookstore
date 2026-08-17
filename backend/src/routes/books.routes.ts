import { Router } from 'express';
import { query, param } from 'express-validator';
import pool from '../db/pool';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { AuthRequest } from '../types/express.d';

export const booksRouter = Router();

const BOOK_SELECT = `
  SELECT b.*,
    json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category,
    json_build_object('id', br.id, 'name', br.name, 'slug', br.slug) AS brand
  FROM books b
  LEFT JOIN categories c ON c.id = b.category_id
  LEFT JOIN brands br ON br.id = b.brand_id
`;

function toBook(r: any) {
  return {
    id: r.id, title: r.title, author: r.author, isbn: r.isbn,
    price: parseFloat(r.price), stock: r.stock,
    coverImageUrl: r.cover_image_url,
    tentativeDeliveryDays: r.tentative_delivery_days,
    category: r.category, brand: r.brand,
  };
}

// GET /books/recommended  (must come before :bookId)
booksRouter.get('/recommended', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt((req.query as any).limit ?? '8', 10);
    // Recommend books from categories the user has ordered before
    const { rows } = await pool.query(`
      ${BOOK_SELECT}
      WHERE b.category_id IN (
        SELECT DISTINCT bk.category_id FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN books bk ON bk.id = oi.book_id
        WHERE o.user_id = $1
      )
      ORDER BY RANDOM() LIMIT $2
    `, [req.userId, limit]);
    // Fallback: top books by stock if no order history
    if (rows.length === 0) {
      const { rows: fallback } = await pool.query(`${BOOK_SELECT} ORDER BY b.stock DESC LIMIT $1`, [limit]);
      res.json(fallback.map(toBook));
      return;
    }
    res.json(rows.map(toBook));
  } catch (err) { next(err); }
});

// GET /books
booksRouter.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  async (req, res, next) => {
    try {
      const { categoryId, brandId, q } = req.query as any;
      const page = parseInt(req.query.page as string ?? '1', 10);
      const limit = parseInt(req.query.limit as string ?? '20', 10);
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: any[] = [];

      if (categoryId) { params.push(categoryId); conditions.push(`b.category_id = $${params.length}`); }
      if (brandId) { params.push(brandId); conditions.push(`b.brand_id = $${params.length}`); }
      if (q) { params.push(`%${q}%`); conditions.push(`(b.title ILIKE $${params.length} OR b.author ILIKE $${params.length})`); }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = await pool.query(`SELECT COUNT(*) FROM books b ${where}`, params);
      const total = parseInt(countResult.rows[0].count, 10);

      params.push(limit, offset);
      const { rows } = await pool.query(`${BOOK_SELECT} ${where} ORDER BY b.title LIMIT $${params.length - 1} OFFSET $${params.length}`, params);

      res.json({ data: rows.map(toBook), total, page, limit });
    } catch (err) { next(err); }
  },
);

// GET /books/:bookId
booksRouter.get('/:bookId', param('bookId').isUUID(), validate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${BOOK_SELECT} WHERE b.id = $1`, [req.params.bookId]);
    if (!rows[0]) { res.status(404).json({ code: 'NOT_FOUND', message: 'Book not found' }); return; }
    const book = toBook(rows[0]);

    // Related products
    const { rows: related } = await pool.query(
      `${BOOK_SELECT} WHERE b.id IN (SELECT related_book_id FROM related_products WHERE book_id = $1)`,
      [req.params.bookId],
    );

    res.json({ ...book, description: rows[0].description, relatedProducts: related.map(toBook) });
  } catch (err) { next(err); }
});
