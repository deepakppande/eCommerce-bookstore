export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  giftPoints: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  price: number;
  stock: number;
  coverImageUrl?: string;
  tentativeDeliveryDays: number;
  category?: Category;
  brand?: Brand;
}

export interface BookDetail extends Book {
  description?: string;
  relatedProducts: Book[];
}

export interface BookPage {
  data: Book[];
  total: number;
  page: number;
  limit: number;
}

export interface CartItem {
  book: Book;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  giftPointsUsed: number;
  placedAt: string;
  cancelDeadline: string;
}

export interface OrderItem {
  book: Book;
  quantity: number;
  unitPrice: number;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  address: Address;
  payment?: Payment;
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  confirmationRef: string;
  amount: number;
  paidAt?: string;
}
