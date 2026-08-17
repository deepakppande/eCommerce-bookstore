## Pull Request — Initial Scaffold: E-Bookstore Platform

### Summary
This PR delivers the complete initial scaffold for the E-Bookstore e-commerce platform as specified in the project brief.

### Changes

#### Backend (`backend/`)
- Express + TypeScript REST API wired to PostgreSQL
- JWT authentication (register, login, logout)
- Full CRUD for: cart, orders, addresses, payments
- Book catalogue with category/brand/search filters
- Personalised recommendations endpoint
- Order cancellation (server-enforced 48-hour window)
- Gift points redemption at order placement
- DB migration + seed scripts
- Supertest API tests: auth, books, cart, orders

#### Frontend (`frontend/`)
- Angular 17 standalone-component SPA
- Tailwind CSS with shared design tokens
- Pages: Login · Register · Home · Catalogue · Book Detail · Cart · Checkout Address · Checkout Payment · Confirmation
- Shared components: Navbar (with cart badge), Footer, ProductCard, Spinner, Alert
- Lazy-loaded routes with `authGuard`
- JWT interceptor attaches token to all requests
- Reactive forms with validation on all input screens
- Karma/Jasmine component + service tests

#### Docs (`docs/`)
- `data-model.md` — full relational schema
- `openapi.yaml` — OpenAPI 3.0 spec for all endpoints

### How to test locally
1. Start PostgreSQL, copy `backend/.env.example` → `.env`, fill in creds
2. `cd backend && npm install && npm run db:migrate && npm run db:seed && npm run dev`
3. `cd frontend && npm install && npm start`
4. Login with `demo@bookstore.com` / `Password1!`

### Checklist
- [x] Responsive on mobile and desktop
- [x] No duplicated UI code
- [x] Loading states on all async flows
- [x] Form validation (login, register, address, payment)
- [x] Tests written for key flows
- [x] Consistent naming and folder structure
