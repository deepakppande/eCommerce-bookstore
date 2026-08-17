#!/bin/sh
set -e

echo "▶ Running database migration..."
node -e "
require('dotenv/config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SQL = \`
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100),
  last_name     VARCHAR(100),
  gift_points   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(50),
  line1       VARCHAR(255) NOT NULL,
  line2       VARCHAR(255),
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country     VARCHAR(100) NOT NULL DEFAULT 'US',
  is_default  BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS brands (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   VARCHAR(255) NOT NULL,
  author                  VARCHAR(255) NOT NULL,
  isbn                    VARCHAR(20) UNIQUE,
  description             TEXT,
  category_id             UUID REFERENCES categories(id),
  brand_id                UUID REFERENCES brands(id),
  price                   NUMERIC(10,2) NOT NULL,
  stock                   INTEGER NOT NULL DEFAULT 0,
  cover_image_url         TEXT,
  tentative_delivery_days INTEGER DEFAULT 5,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS related_products (
  book_id         UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  related_book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, related_book_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id   UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity  INTEGER NOT NULL DEFAULT 1,
  added_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id),
  address_id       UUID NOT NULL REFERENCES addresses(id),
  status           VARCHAR(50) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  total_amount     NUMERIC(10,2) NOT NULL,
  gift_points_used INTEGER NOT NULL DEFAULT 0,
  placed_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ,
  cancel_deadline  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id     UUID NOT NULL REFERENCES books(id),
  quantity    INTEGER NOT NULL,
  unit_price  NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) UNIQUE,
  method           VARCHAR(50) NOT NULL CHECK (method IN ('card','paypal','gift_points')),
  status           VARCHAR(50) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','completed','failed','refunded')),
  confirmation_ref VARCHAR(100),
  amount           NUMERIC(10,2) NOT NULL,
  paid_at          TIMESTAMPTZ
)\`;

pool.connect()
  .then(client => client.query(SQL).then(() => { console.log('✅ Migration done'); client.release(); return pool.end(); }))
  .catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
"

echo "▶ Running database seed..."
node -e "
require('dotenv/config');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query(\`
      INSERT INTO categories (name, slug, description) VALUES
        ('Fiction',     'fiction',     'Novels and short stories'),
        ('Non-Fiction', 'non-fiction', 'Biographies, essays and more'),
        ('Science',     'science',     'Physics, biology, chemistry'),
        ('Technology',  'technology',  'Programming, AI, engineering'),
        ('History',     'history',     'World and regional history')
      ON CONFLICT (slug) DO NOTHING
    \`);

    await client.query(\`
      INSERT INTO brands (name, slug) VALUES
        ('Penguin Books',   'penguin'),
        ('O''Reilly Media', 'oreilly'),
        ('HarperCollins',   'harpercollins'),
        ('MIT Press',       'mit-press'),
        ('Random House',    'random-house')
      ON CONFLICT (slug) DO NOTHING
    \`);

    const hash = bcrypt.hashSync('Password1!', 10);
    await client.query(\`
      INSERT INTO users (email, password_hash, first_name, last_name, gift_points)
      VALUES ('demo@bookstore.com', \$1, 'Demo', 'User', 250)
      ON CONFLICT (email) DO NOTHING
    \`, [hash]);

    const { rows: cats }   = await client.query('SELECT id, slug FROM categories');
    const { rows: brands } = await client.query('SELECT id, slug FROM brands');
    const catMap   = Object.fromEntries(cats.map(c => [c.slug, c.id]));
    const brandMap = Object.fromEntries(brands.map(b => [b.slug, b.id]));

    await client.query(\`
      INSERT INTO books (title, author, isbn, description, category_id, brand_id, price, stock, tentative_delivery_days) VALUES
        ('Clean Code',                         'Robert C. Martin',  '9780132350884', 'A handbook of agile software craftsmanship.',        \$1, \$2, 34.99, 50, 3),
        ('The Pragmatic Programmer',            'Andrew Hunt',       '9780135957059', 'Your journey to mastery.',                          \$1, \$2, 39.99, 40, 4),
        ('Designing Data-Intensive Applications','Martin Kleppmann','9781449373320', 'Big ideas behind reliable, scalable systems.',       \$1, \$3, 49.99, 30, 5),
        ('A Brief History of Time',             'Stephen Hawking',   '9780553380163', 'From the Big Bang to Black Holes.',                 \$4, \$5, 14.99,100, 2),
        ('Sapiens',                             'Yuval Noah Harari', '9780062316110', 'A Brief History of Humankind.',                     \$6, \$7, 17.99, 80, 3),
        ('The Great Gatsby',                    'F. Scott Fitzgerald','9780743273565','A story of the Jazz Age.',                         \$8, \$9, 12.99, 60, 3),
        ('Thinking, Fast and Slow',             'Daniel Kahneman',   '9780374533557', 'How two systems drive the way we think.',          \$10,\$9, 18.99, 45, 4),
        ('The Lean Startup',                    'Eric Ries',         '9780307887894', 'How constant innovation creates radically successful businesses.', \$1, \$9, 22.99, 55, 3)
      ON CONFLICT (isbn) DO NOTHING
    \`, [
      catMap['technology'], brandMap['oreilly'], brandMap['oreilly'],
      catMap['science'],    brandMap['penguin'],
      catMap['history'],    brandMap['harpercollins'],
      catMap['fiction'],    brandMap['random-house'],
      catMap['non-fiction'],
    ]);

    console.log('✅ Seed done');
  } finally {
    client.release();
    await pool.end();
  }
}
seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
"

echo "▶ Starting API server..."
exec node dist/server.js
