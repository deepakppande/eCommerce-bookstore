import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Cart, CartItem } from '../models/models';
import { MOCK_BOOKS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly cart = signal<Cart>({ items: [], totalItems: 0, totalAmount: 0 });

  loadCart(): Observable<Cart> {
    // Cart state is already held in the signal; return a snapshot
    return of(this.cart()).pipe(delay(200));
  }

  addItem(bookId: string, quantity = 1): Observable<Cart> {
    const book = MOCK_BOOKS.find(b => b.id === bookId);
    if (!book) {
      return throwError(() => ({ error: { message: 'Book not found.' } }));
    }

    const items = [...this.cart().items];
    const existing = items.find(i => i.book.id === bookId);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, book.stock);
      existing.subtotal = existing.quantity * book.price;
    } else {
      items.push({ book, quantity, subtotal: quantity * book.price });
    }

    const updated = this.buildCart(items);
    return of(updated).pipe(delay(200), tap(c => this.cart.set(c)));
  }

  updateItem(bookId: string, quantity: number): Observable<Cart> {
    const items = this.cart().items
      .map(i => i.book.id === bookId
        ? { ...i, quantity, subtotal: quantity * i.book.price }
        : i
      )
      .filter(i => i.quantity > 0);

    const updated = this.buildCart(items);
    return of(updated).pipe(delay(150), tap(c => this.cart.set(c)));
  }

  removeItem(bookId: string): Observable<Cart> {
    const items = this.cart().items.filter(i => i.book.id !== bookId);
    const updated = this.buildCart(items);
    return of(updated).pipe(delay(150), tap(c => this.cart.set(c)));
  }

  clearCart(): Observable<void> {
    const empty: Cart = { items: [], totalItems: 0, totalAmount: 0 };
    this.cart.set(empty);
    return of(undefined).pipe(delay(150));
  }

  private buildCart(items: CartItem[]): Cart {
    const totalItems  = items.reduce((s, i) => s + i.quantity, 0);
    const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
    return { items, totalItems, totalAmount: Math.round(totalAmount * 100) / 100 };
  }
}
