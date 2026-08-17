import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { Cart } from '../models/models';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  const mockCart: Cart = {
    items: [{ book: { id: 'b1', title: 'Book A', author: 'Author', price: 10, stock: 5, tentativeDeliveryDays: 3 }, quantity: 2, subtotal: 20 }],
    totalItems: 1,
    totalAmount: 20,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService],
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadCart sets cart signal', () => {
    service.loadCart().subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/cart'));
    req.flush(mockCart);
    expect(service.cart().totalItems).toBe(1);
  });

  it('addItem calls POST and updates signal', () => {
    service.addItem('b1', 1).subscribe();
    const req = httpMock.expectOne(r => r.method === 'POST');
    req.flush(mockCart);
    expect(service.cart().totalAmount).toBe(20);
  });

  it('removeItem calls DELETE /:bookId', () => {
    service.removeItem('b1').subscribe();
    const req = httpMock.expectOne(r => r.method === 'DELETE' && r.url.includes('b1'));
    req.flush({ items: [], totalItems: 0, totalAmount: 0 });
    expect(service.cart().totalItems).toBe(0);
  });
});
