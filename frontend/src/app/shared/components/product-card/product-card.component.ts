import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Book } from '../../../core/models/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, MatTooltipModule],
  template: `
    <mat-card class="mat-card-book" appearance="outlined">
      <!-- Cover image -->
      <a [routerLink]="['/books', book.id]" style="display:block;overflow:hidden;">
        @if (book.coverImageUrl) {
          <img mat-card-image [src]="book.coverImageUrl" [alt]="book.title"
               style="width:100%;aspect-ratio:3/4;object-fit:cover;margin:0;transition:transform 0.2s;"
               onmouseover="this.style.transform='scale(1.05)'"
               onmouseout="this.style.transform='scale(1)'">
        } @else {
          <div class="cover-placeholder" style="aspect-ratio:3/4;">
            <mat-icon style="font-size:48px;width:48px;height:48px;">menu_book</mat-icon>
          </div>
        }
      </a>

      <mat-card-content style="padding:12px;flex:1;display:flex;flex-direction:column;gap:4px;">
        <a [routerLink]="['/books', book.id]"
           style="font-weight:600;font-size:13px;color:inherit;text-decoration:none;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
           [matTooltip]="book.title">
          {{ book.title }}
        </a>
        <p style="font-size:12px;color:#666;margin:0;">{{ book.author }}</p>

        @if (book.category) {
          <mat-chip-set>
            <mat-chip style="font-size:11px;height:22px;">{{ book.category.name }}</mat-chip>
          </mat-chip-set>
        }

        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:8px;">
          <span style="font-weight:700;font-size:15px;">
            ₹{{ book.price }}
          </span>
          <span style="font-size:11px;color:#888;">
            <mat-icon style="font-size:12px;width:12px;height:12px;vertical-align:middle;">local_shipping</mat-icon>
            ~{{ book.tentativeDeliveryDays }}d
          </span>
        </div>
      </mat-card-content>

      @if (showAddToCart) {
        <mat-card-actions style="padding:0 12px 12px;">
          <button mat-flat-button color="primary" style="width:100%;font-size:13px;"
                  (click)="addToCart.emit(book)" [disabled]="book.stock === 0">
            @if (book.stock === 0) { Out of Stock }
            @else { <mat-icon>add_shopping_cart</mat-icon> Add to Cart }
          </button>
        </mat-card-actions>
      }
    </mat-card>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) book!: Book;
  @Input() showAddToCart = true;
  @Output() addToCart = new EventEmitter<Book>();
}
