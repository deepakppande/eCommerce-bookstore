# AI-Assisted Build Prompt: E-Bookstore E-Commerce Platform

Copy everything below into your agentic coding tool (IBM BOB, AWS Kiro, Claude Code, Cursor, etc.) as the project brief.

---

## Project Overview

Build a responsive, full-stack e-commerce web application for an online bookstore. Customers should be able to log in, browse a book catalogue, view product details, add books to a cart, and complete a purchase through checkout and payment. Use modern reusable-component architecture and clean, consistent styling (Tailwind CSS preferred).

## Tech Stack

- **Frontend:** Angular (with Tailwind CSS or Angular Material for styling); responsive for desktop and mobile
- **Backend:** REST API layer (Node.js/Express or equivalent) generated from an OpenAPI spec
- **Database:** PostgreSQL
- **Auth:** Basic user authentication (login/session handling)
- **Version control:** Git, with a feature-branch workflow

## Data Model (design before coding)

Design a relational schema covering at minimum:
- Users (credentials, profile, delivery addresses, gift points balance)
- Books/Products (title, author, category, brand, price, tentative delivery date, related-products links, stock)
- Categories/Brands
- Orders & Order History (status, items, timestamps)
- Cart (items, quantities, per-user)
- Payments (method, status, confirmation reference)

## Pages & User Journeys

### 1. E-Store Home
- Login page with user authentication
- After login: order history with a "Buy It Again" feature
- Recommended items based on order history
- Access to the product catalogue by category

### 2. Catalogue
- Select a product category
- Browse by brand
- Product catalogue grid per category
- Product detail view, tagged with a tentative delivery date
- "Related products" suggestions on the product page
- Add product(s) to the shopping cart

### 3. Shopping Cart
- View/add/remove items in the basket
- Recommended items based on order history
- Consistent footer

### 4. Checkout — Address & Delivery
- Select/enter a delivery address

### 5. Checkout — Payment
- Choose a payment method
- Option to redeem gift points
- Complete the payment

### 6. Purchase Confirmation
- Payment confirmation screen
- Order confirmation message
- Option to cancel the order within 48 hours

## Non-Functional / Build Requirements

- Fully responsive layout (desktop + mobile)
- Reusable components (e.g., navbar, product card, button, form inputs) — no duplicated UI code
- Clear, consistent naming conventions and folder structure
- Loading states and form validation on all interactive flows (cart, checkout, payment)
- Light/dark theme consistency if theming is included
- Clean, de-duplicated CSS/Tailwind classes

## Suggested Build Workflow (for the agent to follow)

1. Design the data model from the pages/journeys above and generate an OpenAPI spec for the backend.
2. Scaffold the Angular frontend project and generate page layouts, reusable components, and routing (Angular Router) for all pages listed above.
3. Generate backend services from the OpenAPI spec and connect them to PostgreSQL.
4. Integrate frontend with backend APIs (auth, catalogue, cart, checkout, payment).
5. Review generated code: check component structure, folder organization, responsiveness, reusable components, and naming conventions; refactor and remove duplication.
6. Run and test locally (web and/or mobile simulator): verify all screens, navigation, cart/payment flows, and responsiveness on desktop and mobile.
7. Improve and refine: fix UI inconsistencies, spacing/alignment, add loading states/validation, optimize reusable components, clean up styling.
8. Generate test cases (unit/API/component) for the key flows: login, catalogue browsing, cart, checkout, payment.
9. Git workflow: create a feature branch, stage and commit changes, push, and open a Pull Request for review.
10. (Optional) Deploy to a local environment or a cloud environment if available (e.g., AWS ROSA, IBM ROKS).

## Deliverable

A working, responsive e-commerce bookstore frontend (and connected backend) with all pages above implemented, pushed to a GitHub repository with a clear commit/PR history.

---

### Example kickoff prompt to paste into the agent first

> Generate a responsive Angular + Tailwind CSS frontend for an online bookstore e-commerce platform. Include a login page, a home page with order history and recommendations, a catalogue page with category/brand filters and product details, a shopping cart, and a checkout flow with address selection, payment (including gift points redemption), and a purchase confirmation page that allows order cancellation within 48 hours. Use reusable Angular components/modules (navbar, product card, buttons, forms) and modern, clean styling. Set up Angular Router routing between all pages and ensure the layout is fully responsive across desktop and mobile.
