import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatBadgeModule, MatMenuModule, MatDividerModule,
  ],
  template: `
    <mat-toolbar color="primary" class="navbar-toolbar">
      <!-- Logo -->
      <a routerLink="/home" class="logo-link" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:inherit;">
        <mat-icon>menu_book</mat-icon>
        <span class="logo-text">E-Bookstore</span>
      </a>

      <span class="spacer" style="flex:1"></span>

      <!-- Desktop nav -->
      <div class="desktop-nav" style="display:flex;align-items:center;gap:4px;">
        <a mat-button routerLink="/home" routerLinkActive="nav-active">
          <mat-icon>home</mat-icon> Home
        </a>
        <a mat-button routerLink="/catalogue" routerLinkActive="nav-active">
          <mat-icon>library_books</mat-icon> Catalogue
        </a>

        <!-- Cart -->
        <a mat-icon-button routerLink="/cart" aria-label="Shopping cart">
          <mat-icon
            [matBadge]="cartCount() > 0 ? cartCount() : null"
            matBadgeColor="accent"
            matBadgeSize="small">
            shopping_cart
          </mat-icon>
        </a>

        <!-- User menu -->
        @if (auth.currentUser()) {
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            {{ auth.currentUser()?.firstName }}
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <span mat-menu-item disabled style="font-size:12px;opacity:0.7;">
              {{ auth.currentUser()?.email }}
            </span>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/home">
              <mat-icon>receipt_long</mat-icon> My Orders
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon> Sign Out
            </button>
          </mat-menu>
        } @else {
          <a mat-raised-button color="accent" routerLink="/login">Sign In</a>
        }
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar-toolbar { position: sticky; top: 0; z-index: 100; }
    .nav-active { background: rgba(255,255,255,0.15); border-radius: 4px; }
    .logo-text { font-size: 18px; font-weight: 600; }
    @media (max-width: 599px) {
      .logo-text { font-size: 15px; }
    }
  `],
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private readonly cartService = inject(CartService);

  cartCount() {
    return this.cartService.cart().totalItems;
  }
}
