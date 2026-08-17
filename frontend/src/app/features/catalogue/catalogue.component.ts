import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { CatalogueService } from '../../core/services/catalogue.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { Book, Category, Brand } from '../../core/models/models';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    RouterLink, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatPaginatorModule, MatDividerModule,
    ProductCardComponent, SpinnerComponent,
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
        <mat-icon color="primary" style="font-size:32px;width:32px;height:32px;">library_books</mat-icon>
        <h1 style="margin:0;font-size:24px;font-weight:600;">Book Catalogue</h1>
        <span style="color:#888;font-size:14px;">({{ total }} books found)</span>
      </div>

      <!-- Filters -->
      <mat-card appearance="outlined" style="margin-bottom:24px;">
        <mat-card-content style="padding:16px;">
          <div style="display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;flex-wrap:wrap;">
            <mat-form-field appearance="outline" style="margin:0;">
              <mat-label>Search books or author</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [(ngModel)]="filters.q" (ngModelChange)="onFilterChange()" placeholder="e.g. Arundhati Roy">
              @if (filters.q) {
                <button matSuffix mat-icon-button (click)="filters.q=''; onFilterChange()">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="margin:0;min-width:160px;">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="filters.categoryId" (ngModelChange)="onFilterChange()">
                <mat-option value="">All Categories</mat-option>
                @for (c of categories; track c.id) {
                  <mat-option [value]="c.id">{{ c.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" style="margin:0;min-width:160px;">
              <mat-label>Publisher</mat-label>
              <mat-select [(ngModel)]="filters.brandId" (ngModelChange)="onFilterChange()">
                <mat-option value="">All Publishers</mat-option>
                @for (b of brands; track b.id) {
                  <mat-option [value]="b.id">{{ b.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Active filter chips -->
          @if (filters.categoryId || filters.brandId || filters.q) {
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
              <span style="font-size:13px;color:#888;align-self:center;">Active filters:</span>
              @if (filters.q) {
                <mat-chip (removed)="filters.q=''; onFilterChange()">
                  "{{ filters.q }}" <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
              @if (filters.categoryId) {
                <mat-chip (removed)="filters.categoryId=''; onFilterChange()">
                  {{ categoryName }} <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
              @if (filters.brandId) {
                <mat-chip (removed)="filters.brandId=''; onFilterChange()">
                  {{ brandName }} <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Grid -->
      @if (loading) { <app-spinner /> }
      @if (!loading && books.length === 0) {
        <mat-card appearance="outlined" style="text-align:center;padding:48px;">
          <mat-icon style="font-size:56px;width:56px;height:56px;color:#bdbdbd;">search_off</mat-icon>
          <p style="color:#666;margin:12px 0;">No books found for this filter.</p>
          <button mat-stroked-button (click)="clearFilters()">Clear Filters</button>
        </mat-card>
      }
      <div class="books-grid">
        @for (book of books; track book.id) {
          <app-product-card [book]="book" (addToCart)="addToCart($event)" />
        }
      </div>

      <!-- Paginator -->
      @if (total > pageSize) {
        <mat-paginator
          [length]="total"
          [pageSize]="pageSize"
          [pageIndex]="page - 1"
          [pageSizeOptions]="[10, 20, 40]"
          (page)="onPage($event)"
          style="margin-top:24px;">
        </mat-paginator>
      }
    </div>
  `,
})
export class CatalogueComponent implements OnInit {
  private readonly catalogue = inject(CatalogueService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);

  books: Book[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  filters = { q: '', categoryId: '', brandId: '' };
  loading = false;
  page = 1;
  pageSize = 20;
  total = 0;

  get categoryName() { return this.categories.find(c => c.id === this.filters.categoryId)?.name ?? ''; }
  get brandName()    { return this.brands.find(b => b.id === this.filters.brandId)?.name ?? ''; }

  ngOnInit() {
    this.catalogue.getCategories().subscribe(c => this.categories = c);
    this.catalogue.getBrands().subscribe(b => this.brands = b);
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) this.filters.categoryId = params['categoryId'];
      this.loadBooks();
    });
  }

  loadBooks() {
    this.loading = true;
    this.catalogue.getBooks({ ...this.filters, page: this.page, limit: this.pageSize }).subscribe({
      next: p => { this.books = p.data; this.total = p.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onFilterChange() { this.page = 1; this.loadBooks(); }

  onPage(e: PageEvent) {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.loadBooks();
  }

  clearFilters() {
    this.filters = { q: '', categoryId: '', brandId: '' };
    this.onFilterChange();
  }

  addToCart(book: Book) {
    this.cart.addItem(book.id, 1).subscribe();
  }
}
