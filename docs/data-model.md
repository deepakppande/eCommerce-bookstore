# E-Bookstore — Relational Data Model

## Entity Relationship Overview

```
users ──< addresses
users ──< cart_items >── books
users ──< orders ──< order_items >── books
orders ──< payments
books >── categories
books >── brands
books ──< related_products >── books
```

---

## Tables

### users
| Column          | Type         | Constraints                  |
|-----------------|--------------|------------------------------|
| id              | UUID         | PK, DEFAULT gen_random_uuid()|
| email           | VARCHAR(255) | UNIQUE NOT NULL              |
| password_hash   | VARCHAR(255) | NOT NULL                     |
| first_name      | VARCHAR(100) |                              |
| last_name       | VARCHAR(100) |                              |
| gift_points     | INTEGER      | NOT NULL DEFAULT 0           |
| created_at      | TIMESTAMPTZ  | DEFAULT NOW()                |
| updated_at      | TIMESTAMPTZ  |                              |

### addresses
| Column      | Type         | Constraints             |
|-------------|--------------|-------------------------|
| id          | UUID         | PK                      |
| user_id     | UUID         | FK → users.id           |
| label       | VARCHAR(50)  | e.g. "Home", "Work"     |
| line1       | VARCHAR(255) | NOT NULL                |
| line2       | VARCHAR(255) |                         |
| city        | VARCHAR(100) | NOT NULL                |
| state       | VARCHAR(100) | NOT NULL                |
| postal_code | VARCHAR(20)  | NOT NULL                |
| country     | VARCHAR(100) | NOT NULL DEFAULT 'US'   |
| is_default  | BOOLEAN      | DEFAULT FALSE           |

### categories
| Column      | Type         | Constraints       |
|-------------|--------------|-------------------|
| id          | UUID         | PK                |
| name        | VARCHAR(100) | UNIQUE NOT NULL   |
| slug        | VARCHAR(100) | UNIQUE NOT NULL   |
| description | TEXT         |                   |

### brands
| Column | Type         | Constraints       |
|--------|--------------|-------------------|
| id     | UUID         | PK                |
| name   | VARCHAR(100) | UNIQUE NOT NULL   |
| slug   | VARCHAR(100) | UNIQUE NOT NULL   |

### books
| Column                  | Type          | Constraints            |
|-------------------------|---------------|------------------------|
| id                      | UUID          | PK                     |
| title                   | VARCHAR(255)  | NOT NULL               |
| author                  | VARCHAR(255)  | NOT NULL               |
| isbn                    | VARCHAR(20)   | UNIQUE                 |
| description             | TEXT          |                        |
| category_id             | UUID          | FK → categories.id     |
| brand_id                | UUID          | FK → brands.id         |
| price                   | NUMERIC(10,2) | NOT NULL               |
| stock                   | INTEGER       | NOT NULL DEFAULT 0     |
| cover_image_url         | TEXT          |                        |
| tentative_delivery_days | INTEGER       | DEFAULT 5              |
| created_at              | TIMESTAMPTZ   | DEFAULT NOW()          |

### related_products
| Column          | Type | Constraints                  |
|-----------------|------|------------------------------|
| book_id         | UUID | FK → books.id                |
| related_book_id | UUID | FK → books.id                |
| PRIMARY KEY (book_id, related_book_id)            |

### cart_items
| Column   | Type        | Constraints              |
|----------|-------------|--------------------------|
| id       | UUID        | PK                       |
| user_id  | UUID        | FK → users.id            |
| book_id  | UUID        | FK → books.id            |
| quantity | INTEGER     | NOT NULL DEFAULT 1       |
| added_at | TIMESTAMPTZ | DEFAULT NOW()            |
| UNIQUE (user_id, book_id)                        |

### orders
| Column            | Type          | Constraints                                              |
|-------------------|---------------|----------------------------------------------------------|
| id                | UUID          | PK                                                       |
| user_id           | UUID          | FK → users.id                                            |
| address_id        | UUID          | FK → addresses.id                                        |
| status            | VARCHAR(50)   | CHECK IN (pending,confirmed,shipped,delivered,cancelled) |
| total_amount      | NUMERIC(10,2) | NOT NULL                                                 |
| gift_points_used  | INTEGER       | DEFAULT 0                                                |
| placed_at         | TIMESTAMPTZ   | DEFAULT NOW()                                            |
| updated_at        | TIMESTAMPTZ   |                                                          |
| cancel_deadline   | TIMESTAMPTZ   | placed_at + INTERVAL '48 hours'                          |

### order_items
| Column     | Type          | Constraints     |
|------------|---------------|-----------------|
| id         | UUID          | PK              |
| order_id   | UUID          | FK → orders.id  |
| book_id    | UUID          | FK → books.id   |
| quantity   | INTEGER       | NOT NULL        |
| unit_price | NUMERIC(10,2) | NOT NULL        |

### payments
| Column           | Type          | Constraints                                    |
|------------------|---------------|------------------------------------------------|
| id               | UUID          | PK                                             |
| order_id         | UUID          | FK → orders.id UNIQUE                          |
| method           | VARCHAR(50)   | CHECK IN (card,paypal,gift_points)             |
| status           | VARCHAR(50)   | CHECK IN (pending,completed,failed,refunded)   |
| confirmation_ref | VARCHAR(100)  |                                                |
| amount           | NUMERIC(10,2) | NOT NULL                                       |
| paid_at          | TIMESTAMPTZ   |                                                |
