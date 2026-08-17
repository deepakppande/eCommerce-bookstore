import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'catalogue',
    canActivate: [authGuard],
    loadComponent: () => import('./features/catalogue/catalogue.component').then(m => m.CatalogueComponent),
  },
  {
    path: 'books/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/book-detail/book-detail.component').then(m => m.BookDetailComponent),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'checkout/address',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/address/checkout-address.component').then(m => m.CheckoutAddressComponent),
  },
  {
    path: 'checkout/payment',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/payment/checkout-payment.component').then(m => m.CheckoutPaymentComponent),
  },
  {
    path: 'confirmation/:orderId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/confirmation/confirmation.component').then(m => m.ConfirmationComponent),
  },
  { path: '**', redirectTo: 'home' },
];
