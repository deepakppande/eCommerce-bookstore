export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  gift_points: number;
  created_at: Date;
  updated_at: Date | null;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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
  isbn: string | null;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  price: number;
  stock: number;
  cover_image_url: string | null;
  tentative_delivery_days: number;
  created_at: Date;
}

export interface CartItem {
  id: string;
  user_id: string;
  book_id: string;
  quantity: number;
  added_at: Date;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  status: string;
  total_amount: number;
  gift_points_used: number;
  placed_at: Date;
  updated_at: Date | null;
  cancel_deadline: Date | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  quantity: number;
  unit_price: number;
}

export interface Payment {
  id: string;
  order_id: string;
  method: string;
  status: string;
  confirmation_ref: string | null;
  amount: number;
  paid_at: Date | null;
}
