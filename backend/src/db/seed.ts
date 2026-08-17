import pool from './pool';
import bcrypt from 'bcryptjs';

async function seed() {
  const client = await pool.connect();
  try {
    // Categories
    await client.query(`
      INSERT INTO categories (name, slug, description) VALUES
        ('Fiction',     'fiction',     'Novels and short stories'),
        ('Non-Fiction', 'non-fiction', 'Biographies, essays and more'),
        ('Science',     'science',     'Physics, biology, chemistry'),
        ('Technology',  'technology',  'Programming, AI, engineering'),
        ('History',     'history',     'World and regional history')
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Brands (publishers)
    await client.query(`
      INSERT INTO brands (name, slug) VALUES
        ('Penguin Books',    'penguin'),
        ('O''Reilly Media',  'oreilly'),
        ('HarperCollins',    'harpercollins'),
        ('MIT Press',        'mit-press'),
        ('Random House',     'random-house')
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Sample user
    const hash = await bcrypt.hash('Password1!', 10);
    await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, gift_points)
      VALUES ('demo@bookstore.com', $1, 'Demo', 'User', 250)
      ON CONFLICT (email) DO NOTHING;
    `, [hash]);

    // Sample books
    const { rows: cats } = await client.query(`SELECT id, slug FROM categories`);
    const { rows: brands } = await client.query(`SELECT id, slug FROM brands`);
    const catMap: Record<string, string> = {};
    cats.forEach((c: { id: string; slug: string }) => { catMap[c.slug] = c.id; });
    const brandMap: Record<string, string> = {};
    brands.forEach((b: { id: string; slug: string }) => { brandMap[b.slug] = b.id; });

    await client.query(`
      INSERT INTO books (title, author, isbn, description, category_id, brand_id, price, stock, tentative_delivery_days) VALUES
        ('Clean Code',           'Robert C. Martin', '9780132350884', 'A handbook of agile software craftsmanship.',
          $1, $2, 34.99, 50, 3),
        ('The Pragmatic Programmer', 'Andrew Hunt', '9780135957059', 'Your journey to mastery.',
          $1, $2, 39.99, 40, 4),
        ('Designing Data-Intensive Applications', 'Martin Kleppmann', '9781449373320', 'Big ideas behind reliable systems.',
          $1, $3, 49.99, 30, 5),
        ('A Brief History of Time', 'Stephen Hawking', '9780553380163', 'From the Big Bang to Black Holes.',
          $4, $5, 14.99, 100, 2),
        ('Sapiens', 'Yuval Noah Harari', '9780062316110', 'A Brief History of Humankind.',
          $6, $7, 17.99, 80, 3)
      ON CONFLICT (isbn) DO NOTHING;
    `, [
      catMap['technology'], brandMap['oreilly'], brandMap['oreilly'],
      catMap['science'], brandMap['penguin'],
      catMap['history'], brandMap['harpercollins'],
    ]);

    console.log('✅ Database seeded');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
