import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { categoriesRouter } from './routes/categories.routes';
import { brandsRouter } from './routes/brands.routes';
import { booksRouter } from './routes/books.routes';
import { cartRouter } from './routes/cart.routes';
import { ordersRouter } from './routes/orders.routes';
import { paymentsRouter } from './routes/payments.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

const BASE = '/api/v1';
app.use(`${BASE}/auth`, authRouter);
app.use(`${BASE}/users`, usersRouter);
app.use(`${BASE}/categories`, categoriesRouter);
app.use(`${BASE}/brands`, brandsRouter);
app.use(`${BASE}/books`, booksRouter);
app.use(`${BASE}/cart`, cartRouter);
app.use(`${BASE}/orders`, ordersRouter);
app.use(`${BASE}/payments`, paymentsRouter);

app.use(errorHandler);

export default app;
