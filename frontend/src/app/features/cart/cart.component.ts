import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CartItem, Book } from '../../core/models/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatDividerModule,
    ProductCardComponent, SpinnerComponent,
  ],
  template: `
    <div class="page-container">
      <h1 style="font-size:24px;font-weight:600;margin:0 0 24px;display:flex;align-items:center;gap:8px;">
        <mat-icon color="primary">shopping_cart</mat-icon> Shopping Cart
      </h1>

      @if (loading) { <app-spinner /> }

      <div style="display:grid;grid-template-columns:1fr;gap:24px;">
        <!-- Left: items -->
        <div style="grid-column:1;">
          @if (!loading && cart.items.length === 0) {
            <mat-card appearance="outlined" style="text-align:center;padding:48px;">
              <mat-icon style="font-size:64px;width:64px;height:64px;color:#bdbdbd;">remove_shopping_cart</mat-icon>
              <p style="color:#666;margin:12px 0;">Your cart is empty.</p>
              <a mat-flat-button color="primary" routerLink="/catalogue">
                <mat-icon>library_books</mat-icon> Browse Books
              </a>
            </mat-card>
          }

          <div style="display:flex;flex-direction:column;gap:12px;">
            @for (item of cart.items; track item.book.id) {
              <mat-card appearance="outlined">
                <mat-card-content style="padding:16px;display:flex;gap:16px;align-items:flex-start;">
                  <!-- Cover -->
                  <a [routerLink]="['/books', item.book.id]" style="flex-shrink:0;">
                    @if (item.book.coverImageUrl) {
                      <img [src]="item.book.coverImageUrl" [alt]="item.book.title"
                           style="width:64px;height:80px;object-fit:cover;border-radius:4px;">
                    } @else {
                      <div style="width:64px;height:80px;background:#e8eaf6;border-radius:4px;display:flex;align-items:center;justify-content:center;">
                        <mat-icon color="primary">menu_book</mat-icon>
                      </div>
                    }
                  </a>

                  <!-- Info -->
                  <div style="flex:1;min-width:0;">
                    <a [routerLink]="['/books', item.book.id]"
                       style="font-weight:600;font-size:14px;color:inherit;text-decoration:none;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                      {{ item.book.title }}
                    </a>
                    <p style="font-size:12px;color:#888;margin:2px 0 8px;">{{ item.book.author }}</p>
                    <p style="font-size:14px;font-weight:500;margin:0 0 8px;">₹{{ item.book.price }} each</p>

                    <!-- Qty controls -->
                    <div style="display:flex;align-items:center;gap:8px;">
                      <button mat-icon-button (click)="updateQty(item, item.quantity - 1)"
                              [disabled]="item.quantity <= 1" style="width:32px;height:32px;">
                        <mat-icon>remove</mat-icon>
                      </button>
                      <span style="font-weight:600;min-width:24px;text-align:center;">{{ item.quantity }}</span>
                      <button mat-icon-button (click)="updateQty(item, item.quantity + 1)"
                              [disabled]="item.quantity >= item.book.stock" style="width:32px;height:32px;">
                        <mat-icon>add</mat-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Subtotal & remove -->
                  <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;height:80px;">
                    <button mat-icon-button color="warn" (click)="removeItem(item)" aria-label="Remove">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                    <span style="font-weight:700;font-size:16px;">₹{{ item.subtotal }}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </div>

        <!-- Right: summary (only shown when items exist) -->
        @if (cart.items.length > 0) {
          <mat-card appearance="raised" style="align-self:start;position:sticky;top:80px;">
            <mat-card-header>
              <mat-card-title>Order Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content style="padding:0 16px 16px;">
              <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;">
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:#666;">Items ({{ cart.totalItems }})</span>
                  <span>₹{{ cart.totalAmount }}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:#666;">Delivery</span>
                  <span style="color:#388e3c;font-weight:600;">FREE</span>
                </div>
                <mat-divider></mat-divider>
                <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;">
                  <span>Total</span>
                  <span>₹{{ cart.totalAmount }}</span>
                </div>
                <p style="font-size:11px;color:#999;margin:0;">Inclusive of all taxes. Prices in INR (₹).</p>
              </div>
            </mat-card-content>
            <mat-card-actions style="padding:0 16px 16px;">
              <button mat-flat-button color="primary" style="width:100%;height:44px;font-size:15px;" (click)="checkout()">
                <mat-icon>payment</mat-icon> Proceed to Checkout
              </button>
            </mat-card-actions>
          </mat-card>
        }
      </div>

      <!-- Recommendations -->
      @if (recommended.length > 0) {
        <mat-divider style="margin:32px 0;"></mat-divider>
        <section>
          <h2 style="font-size:18px;font-weight:600;margin:0 0 16px;display:flex;align-items:center;gap:8px;">
            <mat-icon color="primary">recommend</mat-icon> You Might Also Like
          </h2>
          <div class="books-grid-4">
            @for (book of recommended; track book.id) {
              <app-product-card [book]="book" (addToCart)="addToCart($event)" />
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    @media (min-width: 768px) {
      div[style*="grid-template-columns:1fr;"] {
        grid-template-columns: 2fr 1fr !important;
      }
    }
  `],
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly catalogue = inject(CatalogueService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  loading = true;
  recommended: Book[] = [];

  get cart() { return this.cartService.cart(); }

  ngOnInit() {
    this.cartService.loadCart().subscribe({ next: () => this.loading = false, error: () => this.loading = false });
    this.catalogue.getRecommended(4).subscribe(r => this.recommended = r);
  }

  updateQty(item: CartItem, qty: number) {
    if (qty < 1) return;
    this.cartService.updateItem(item.book.id, qty).subscribe();
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.book.id).subscribe({
      next: () => this.snackBar.open(`"${item.book.title}" removed from cart.`, '', { duration: 2000 }),
    });
  }

  addToCart(book: Book) {
    this.cartService.addItem(book.id, 1).subscribe({
      next: () => this.snackBar.open(`"${book.title}" added to cart!`, '', { duration: 2000, panelClass: 'snack-success' }),
    });
  }

  checkout() {
    this.router.navigate(['/checkout/address']);
  }
}
