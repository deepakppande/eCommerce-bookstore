# E-Bookstore — Full-Stack E-Commerce Platform

A responsive Angular + Node.js bookstore application with full cart, checkout, and payment flows.

## Project Structure

```
eCommerce-bookstore/
├── docs/
│   ├── data-model.md      # Relational schema design
│   └── openapi.yaml       # OpenAPI 3.0 spec (source of truth for the API)
├── backend/               # Node.js / Express REST API (TypeScript)
│   ├── src/
│   │   ├── app.ts         # Express app + route wiring
│   │   ├── server.ts      # HTTP server entry point
│   │   ├── db/            # pool, migrate, seed
│   │   ├── middleware/    # auth, validate, error
│   │   ├── routes/        # auth, users, books, cart, orders, payments
│   │   └── types/         # TypeScript models & Express augmentation
│   └── __tests__/         # Supertest API tests
└── frontend/              # Angular 17 standalone-component SPA
    └── src/app/
        ├── core/          # models, services (auth, catalogue, cart, checkout), guards, interceptors
        ├── shared/        # navbar, footer, product-card, spinner, alert
        └── features/      # auth, home, catalogue, book-detail, cart, checkout, confirmation
```

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| Frontend   | Angular 17 (standalone) + Tailwind CSS v3      |
| Backend    | Node.js 20 + Express 4 (TypeScript)            |
| Database   | PostgreSQL 15                                  |
| Auth       | JWT (jsonwebtoken + bcryptjs)                  |
| Testing    | Jest + Supertest (API) · Karma + Jasmine (UI)  |

## Pages Implemented

| Route                   | Page                          |
|-------------------------|-------------------------------|
| `/login`                | Login                         |
| `/register`             | Register                      |
| `/home`                 | Home (order history + recs)   |
| `/catalogue`            | Book catalogue + filters      |
| `/books/:id`            | Book detail + related         |
| `/cart`                 | Shopping cart                 |
| `/checkout/address`     | Checkout — Address step       |
| `/checkout/payment`     | Checkout — Payment step       |
| `/confirmation/:id`     | Purchase confirmation + cancel|

## Quick Start (Frontend only — no backend needed)

The frontend runs entirely on mock data. No backend or database setup required.

```bash
cd frontend
npm install
npm start         # starts on http://localhost:4200
```

### Demo credentials

| Field    | Value               |
|----------|---------------------|
| Email    | demo@example.com    |
| Password | password            |

## Backend (optional)

If you want to run the full backend API:

```bash
cd backend
cp .env.example .env          # edit DATABASE_URL and JWT_SECRET
npm install
npm run db:migrate            # create tables
npm run db:seed               # seed sample data
npm run dev                   # starts on http://localhost:3000
```

## API Overview

Base URL: `http://localhost:3000/api/v1`

| Method | Path                        | Description                   |
|--------|-----------------------------|-------------------------------|
| POST   | /auth/register              | Create account                |
| POST   | /auth/login                 | Login → JWT                   |
| GET    | /books                      | List/search books             |
| GET    | /books/recommended          | Personalised recommendations  |
| GET    | /books/:id                  | Book detail + related         |
| GET    | /cart                       | Current user's cart           |
| POST   | /cart                       | Add item                      |
| PATCH  | /cart/:bookId               | Update quantity               |
| DELETE | /cart/:bookId               | Remove item                   |
| GET    | /orders                     | Order history                 |
| POST   | /orders                     | Place order (checkout)        |
| POST   | /orders/:id/cancel          | Cancel within 48 h            |
| POST   | /payments                   | Process payment               |

Full spec: [`docs/openapi.yaml`](docs/openapi.yaml)

## Running Tests

```bash
# Frontend (unit/component tests)
cd frontend && npm test

# Backend (API/integration tests — requires Postgres running)
cd backend && npm test
```

## Non-Functional Checklist

- [x] Fully responsive (mobile + desktop via Tailwind)
- [x] Reusable components — NavBar, Footer, ProductCard, Spinner, Alert
- [x] No duplicated UI code (shared component library)
- [x] Loading states on all async operations
- [x] Form validation on login, register, address, payment
- [x] Auth guard protecting all authenticated routes
- [x] Order cancellation within 2-hour window
- [x] Gift points redemption at checkout
- [x] Personalised book recommendations
- [x] OpenAPI spec covers all endpoints
- [x] Relational schema with FK constraints & stock management
