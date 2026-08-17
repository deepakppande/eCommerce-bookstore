import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogueService } from '../../core/services/catalogue.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { BookDetail, Book } from '../../core/models/models';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule,
    ProductCardComponent, SpinnerComponent,
  ],
  template: `
    <div class="page-container">
      @if (loading) { <app-spinner /> }

      @if (!loading && book) {
        <!-- Breadcrumb -->
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:20px;font-size:13px;color:#666;">
          <a routerLink="/catalogue" style="color:#3f51b5;text-decoration:none;">Catalogue</a>
          <mat-icon style="font-size:16px;width:16px;height:16px;">chevron_right</mat-icon>
          <span>{{ book.category?.name }}</span>
          <mat-icon style="font-size:16px;width:16px;height:16px;">chevron_right</mat-icon>
          <span style="color:#333;">{{ book.title }}</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 2fr;gap:32px;">
          <!-- Cover -->
          <div>
            <mat-card appearance="raised" style="overflow:hidden;">
              @if (book.coverImageUrl) {
                <img mat-card-image [src]="book.coverImageUrl" [alt]="book.title"
                     style="width:100%;aspect-ratio:3/4;object-fit:cover;margin:0;">
              } @else {
                <div class="cover-placeholder" style="aspect-ratio:3/4;">
                  <mat-icon style="font-size:64px;width:64px;height:64px;">menu_book</mat-icon>
                </div>
              }
            </mat-card>
          </div>

          <!-- Details -->
          <div>
            <h1 style="font-size:26px;font-weight:700;margin:0 0 4px;">{{ book.title }}</h1>
            <p style="color:#555;margin:0 0 4px;font-size:15px;">by <strong>{{ book.author }}</strong></p>
            @if (book.isbn) {
              <p style="font-size:12px;color:#999;margin:0 0 16px;">ISBN: {{ book.isbn }}</p>
            }

            <!-- Tags -->
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
              @if (book.category) {
                <mat-chip color="primary" highlighted>{{ book.category.name }}</mat-chip>
              }
              @if (book.brand) {
                <mat-chip>{{ book.brand.name }}</mat-chip>
              }
            </div>

            <!-- Price & delivery card -->
            <mat-card appearance="outlined" style="margin-bottom:16px;">
              <mat-card-content style="padding:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                <div>
                  <p style="margin:0;font-size:13px;color:#888;">Price</p>
                  <p style="margin:0;font-size:28px;font-weight:700;color:#3f51b5;">₹{{ book.price }}</p>
                </div>
                <mat-divider vertical style="height:40px;"></mat-divider>
                <div>
                  <p style="margin:0;font-size:13px;color:#888;">Delivery</p>
                  <p style="margin:0;font-size:16px;font-weight:600;">~{{ book.tentativeDeliveryDays }} business days</p>
                </div>
                <mat-divider vertical style="height:40px;"></mat-divider>
                <div>
                  <p style="margin:0;font-size:13px;color:#888;">Stock</p>
                  @if (book.stock > 0) {
                    <mat-chip color="primary" highlighted style="font-size:12px;height:24px;">In Stock ({{ book.stock }})</mat-chip>
                  } @else {
                    <mat-chip color="warn" highlighted style="font-size:12px;height:24px;">Out of Stock</mat-chip>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            @if (book.description) {
              <div style="margin-bottom:20px;">
                <h3 style="font-size:15px;font-weight:600;margin:0 0 8px;">About this book</h3>
                <p style="color:#555;line-height:1.7;font-size:14px;margin:0;">{{ book.description }}</p>
              </div>
            }

            <button mat-flat-button color="primary" style="height:44px;min-width:160px;font-size:15px;"
                    (click)="addToCart()" [disabled]="book.stock === 0 || addingToCart">
              @if (addingToCart) {
                Adding…
              } @else {
                <mat-icon>add_shopping_cart</mat-icon>
                Add to Cart — ₹{{ book.price }}
              }
            </button>
          </div>
        </div>

        <!-- Related Products -->
        @if (book.relatedProducts?.length) {
          <mat-divider style="margin:32px 0;"></mat-divider>
          <section>
            <h2 style="font-size:18px;font-weight:600;margin:0 0 16px;display:flex;align-items:center;gap:8px;">
              <mat-icon color="primary">auto_stories</mat-icon> You May Also Like
            </h2>
            <div class="books-grid-4">
              @for (related of book.relatedProducts; track related.id) {
                <app-product-card [book]="related" (addToCart)="addToCartBook($event)" />
              }
            </div>
          </section>
        }
      }
    </div>
  `,
})
export class BookDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogue = inject(CatalogueService);
  private readonly cart = inject(CartService);
  private readonly snackBar = inject(MatSnackBar);

  book: BookDetail | null = null;
  loading = true;
  addingToCart = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.catalogue.getBookById(id).subscribe({
      next: b => { this.book = b; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  addToCart() {
    if (!this.book) return;
    this.addingToCart = true;
    this.cart.addItem(this.book.id, 1).subscribe({
      next: () => {
        this.addingToCart = false;
        this.snackBar.open(`"${this.book!.title}" added to cart!`, 'View Cart', {
          duration: 3000,
          panelClass: 'snack-success',
        }).onAction().subscribe(() => window.location.href = '/cart');
      },
      error: () => { this.addingToCart = false; },
    });
  }

  addToCartBook(book: Book) {
    this.cart.addItem(book.id, 1).subscribe({
      next: () => this.snackBar.open(`"${book.title}" added to cart!`, '', { duration: 2000, panelClass: 'snack-success' }),
    });
  }
}
