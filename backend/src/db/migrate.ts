import pool from './pool';

const SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- users
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

-- addresses
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

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- brands
CREATE TABLE IF NOT EXISTS brands (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

-- books
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

-- related_products
CREATE TABLE IF NOT EXISTS related_products (
  book_id         UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  related_book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, related_book_id)
);

-- cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id   UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity  INTEGER NOT NULL DEFAULT 1,
  added_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, book_id)
);

-- orders
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

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id     UUID NOT NULL REFERENCES books(id),
  quantity    INTEGER NOT NULL,
  unit_price  NUMERIC(10,2) NOT NULL
);

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) UNIQUE,
  method           VARCHAR(50) NOT NULL CHECK (method IN ('card','paypal','gift_points')),
  status           VARCHAR(50) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','completed','failed','refunded')),
  confirmation_ref VARCHAR(100),
  amount           NUMERIC(10,2) NOT NULL,
  paid_at          TIMESTAMPTZ
);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(SQL);
    console.log('✅ Database migration complete');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
