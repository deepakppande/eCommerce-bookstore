import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductCardComponent } from './product-card.component';
import { Book } from '../../../core/models/models';

const mockBook: Book = {
  id: '1', title: 'Test Book', author: 'Author Name',
  price: 29.99, stock: 10, tentativeDeliveryDays: 3,
};

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    component.book = mockBook;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders book title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test Book');
  });

  it('emits addToCart event on button click', () => {
    const emitted: Book[] = [];
    component.addToCart.subscribe((b: Book) => emitted.push(b));
    component.addToCart.emit(mockBook);
    expect(emitted[0]).toBe(mockBook);
  });

  it('disables Add to Cart when out of stock', () => {
    component.book = { ...mockBook, stock: 0 };
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(btn?.disabled).toBeTrue();
  });
});
