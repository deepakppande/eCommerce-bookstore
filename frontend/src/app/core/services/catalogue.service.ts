import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Book, BookDetail, BookPage, Category, Brand } from '../models/models';
import { MOCK_CATEGORIES, MOCK_BRANDS, MOCK_BOOKS, MOCK_BOOK_DETAILS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class CatalogueService {

  getCategories(): Observable<Category[]> {
    return of([...MOCK_CATEGORIES]).pipe(delay(200));
  }

  getBrands(): Observable<Brand[]> {
    return of([...MOCK_BRANDS]).pipe(delay(200));
  }

  getBooks(
    filters: { categoryId?: string; brandId?: string; q?: string; page?: number; limit?: number } = {}
  ): Observable<BookPage> {
    let results = [...MOCK_BOOKS];

    if (filters.categoryId) {
      results = results.filter(b => b.category?.id === filters.categoryId);
    }
    if (filters.brandId) {
      results = results.filter(b => b.brand?.id === filters.brandId);
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      results = results.filter(b =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }

    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 20;
    const total = results.length;
    const data  = results.slice((page - 1) * limit, page * limit);

    return of({ data, total, page, limit }).pipe(delay(300));
  }

  getBookById(id: string): Observable<BookDetail> {
    const book = MOCK_BOOK_DETAILS[id];
    if (!book) {
      return new Observable(observer => {
        observer.error({ status: 404, error: { message: 'Book not found.' } });
      });
    }
    return of({ ...book }).pipe(delay(250));
  }

  getRecommended(limit = 8): Observable<Book[]> {
    // Return a shuffled slice of the mock books
    const shuffled = [...MOCK_BOOKS].sort(() => Math.random() - 0.5);
    return of(shuffled.slice(0, limit)).pipe(delay(250));
  }
}
