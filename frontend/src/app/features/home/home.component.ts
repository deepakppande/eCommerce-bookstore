import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/services/auth.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { Book, Order, Category } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink, DatePipe, TitleCasePipe,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatDividerModule, MatProgressSpinnerModule, MatTabsModule,
    ProductCardComponent, SpinnerComponent,
  ],
  template: `
    <div class="page-container">

      <!-- Greeting banner -->
      <mat-card appearance="outlined" style="margin-bottom:24px;background:linear-gradient(135deg,#3f51b5,#7c4dff);color:white;">
        <mat-card-content style="padding:24px;">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <mat-icon style="font-size:48px;width:48px;height:48px;opacity:0.9;">account_circle</mat-icon>
            <div>
              <h1 style="margin:0;font-size:24px;font-weight:600;">
                नमस्ते, {{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}! 🙏
              </h1>
              <p style="margin:4px 0 0;opacity:0.85;">
                Welcome back to E-Bookstore.
                You have <strong>{{ auth.currentUser()?.giftPoints ?? 0 }}</strong> gift points (₹{{ auth.currentUser()?.giftPoints ?? 0 }} value).
              </p>
            </div>
            <div style="margin-left:auto;">
              <a mat-raised-button routerLink="/catalogue" color="accent">
                <mat-icon>search</mat-icon> Browse Books
              </a>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Categories -->
      <section style="margin-bottom:32px;">
        <h2 style="font-size:18px;font-weight:600;margin:0 0 16px;display:flex;align-items:center;gap:8px;">
          <mat-icon color="primary">category</mat-icon> Browse by Category
        </h2>
        @if (loadingCategories) { <app-spinner /> }
        <div class="category-grid">
          @for (cat of categories; track cat.id) {
            <a [routerLink]="['/catalogue']" [queryParams]="{ categoryId: cat.id }"
               style="text-decoration:none;">
              <mat-card appearance="outlined" style="text-align:center;cursor:pointer;transition:box-shadow 0.2s;"
                        class="mat-card-book">
                <mat-card-content style="padding:16px 8px;">
                  <mat-icon color="primary" style="font-size:28px;width:28px;height:28px;">auto_stories</mat-icon>
                  <p style="margin:6px 0 2px;font-weight:600;font-size:13px;">{{ cat.name }}</p>
                  <p style="margin:0;font-size:11px;color:#666;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">{{ cat.description }}</p>
                </mat-card-content>
              </mat-card>
            </a>
          }
        </div>
      </section>

      <!-- Recommended -->
      <section style="margin-bottom:32px;">
        <h2 style="font-size:18px;font-weight:600;margin:0 0 16px;display:flex;align-items:center;gap:8px;">
          <mat-icon color="primary">recommend</mat-icon> Recommended for You
        </h2>
        @if (loadingRecs) { <app-spinner /> }
        <div class="books-grid-4">
          @for (book of recommended; track book.id) {
            <app-product-card [book]="book" (addToCart)="addToCart($event)" />
          }
        </div>
      </section>

      <!-- Orders -->
      <section>
        <h2 style="font-size:18px;font-weight:600;margin:0 0 16px;display:flex;align-items:center;gap:8px;">
          <mat-icon color="primary">receipt_long</mat-icon> Your Orders
        </h2>
        @if (loadingOrders) { <app-spinner /> }
        @if (!loadingOrders && orders.length === 0) {
          <mat-card appearance="outlined" style="text-align:center;padding:40px;">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#bdbdbd;">shopping_bag</mat-icon>
            <p style="color:#666;margin:12px 0;">No orders yet.</p>
            <a mat-flat-button color="primary" routerLink="/catalogue">Start Shopping</a>
          </mat-card>
        }
        <div style="display:flex;flex-direction:column;gap:12px;">
          @for (order of orders; track order.id) {
            <mat-card appearance="outlined">
              <mat-card-content style="padding:16px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;justify-content:space-between;">
                  <div>
                    <p style="margin:0;font-weight:600;">Order #{{ order.id.slice(0,8).toUpperCase() }}</p>
                    <p style="margin:2px 0 6px;font-size:12px;color:#888;">
                      {{ order.placedAt | date:'dd/MM/yyyy, h:mm a' }}
                    </p>
                    <mat-chip [class]="'chip-' + order.status" style="font-size:12px;height:24px;">
                      {{ order.status | titlecase }}
                    </mat-chip>
                  </div>
                  <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                    <span style="font-size:18px;font-weight:700;">₹{{ order.totalAmount }}</span>
                    <a mat-stroked-button [routerLink]="['/confirmation', order.id]">View</a>
                    @if (order.status !== 'cancelled') {
                      <button mat-flat-button color="primary" (click)="buyAgain(order.id)">
                        <mat-icon>replay</mat-icon> Buy Again
                      </button>
                    }
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly catalogue = inject(CatalogueService);
  private readonly checkout = inject(CheckoutService);
  private readonly cart = inject(CartService);

  categories: Category[] = [];
  recommended: Book[] = [];
  orders: Order[] = [];

  loadingCategories = true;
  loadingRecs = true;
  loadingOrders = true;

  ngOnInit() {
    this.catalogue.getCategories().subscribe({ next: c => { this.categories = c; this.loadingCategories = false; }, error: () => { this.loadingCategories = false; } });
    this.catalogue.getRecommended().subscribe({ next: r => { this.recommended = r; this.loadingRecs = false; }, error: () => { this.loadingRecs = false; } });
    this.checkout.getOrders().subscribe({ next: o => { this.orders = o; this.loadingOrders = false; }, error: () => { this.loadingOrders = false; } });
    this.cart.loadCart().subscribe();
  }

  addToCart(book: Book) {
    this.cart.addItem(book.id, 1).subscribe();
  }

  buyAgain(orderId: string) {
    window.location.href = `/confirmation/${orderId}`;
  }
}
