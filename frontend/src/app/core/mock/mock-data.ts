import { User, AuthResponse, Category, Brand, Book, BookDetail, Cart, Address, Order, OrderDetail, Payment } from '../models/models';

// ── Users ──────────────────────────────────────────────────────────────────
export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'user-001',
    email: 'demo@example.com',
    password: 'password',
    firstName: 'Rahul',
    lastName: 'Sharma',
    giftPoints: 350,
  },
  {
    id: 'user-002',
    email: 'priya@example.com',
    password: 'password',
    firstName: 'Priya',
    lastName: 'Patel',
    giftPoints: 120,
  },
  {
    id: 'user-003',
    email: 'amit@example.com',
    password: 'password',
    firstName: 'Amit',
    lastName: 'Kulkarni',
    giftPoints: 80,
  },
];

// ── Categories ─────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-001', name: 'Fiction',           slug: 'fiction',           description: 'Novels, short stories & more' },
  { id: 'cat-002', name: 'Non-Fiction',        slug: 'non-fiction',        description: 'Real-world stories & insights' },
  { id: 'cat-003', name: 'Indian Literature',  slug: 'indian-literature',  description: 'Regional & national classics' },
  { id: 'cat-004', name: 'Technology',         slug: 'technology',         description: 'Programming, AI & beyond' },
  { id: 'cat-005', name: 'History',            slug: 'history',            description: 'Indian & world history' },
  { id: 'cat-006', name: 'Self-Help',          slug: 'self-help',          description: 'Personal growth & productivity' },
  { id: 'cat-007', name: 'Children',           slug: 'children',           description: 'Books for young readers' },
  { id: 'cat-008', name: 'Biography',          slug: 'biography',          description: 'Life stories of great people' },
];

// ── Brands (Publishers) ────────────────────────────────────────────────────
export const MOCK_BRANDS: Brand[] = [
  { id: 'brand-001', name: 'Penguin India',         slug: 'penguin-india' },
  { id: 'brand-002', name: 'HarperCollins India',   slug: 'harpercollins-india' },
  { id: 'brand-003', name: 'Rupa Publications',     slug: 'rupa-publications' },
  { id: 'brand-004', name: 'Westland Books',        slug: 'westland-books' },
  { id: 'brand-005', name: 'Orient Blackswan',      slug: 'orient-blackswan' },
  { id: 'brand-006', name: 'Bloomsbury India',      slug: 'bloomsbury-india' },
];

// ── Books ──────────────────────────────────────────────────────────────────
export const MOCK_BOOKS: Book[] = [
  {
    id: 'book-001',
    title: 'The God of Small Things',
    author: 'Arundhati Roy',
    isbn: '978-0143028031',
    price: 349,
    stock: 18,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8223782-M.jpg',
    tentativeDeliveryDays: 3,
    category: MOCK_CATEGORIES[0],
    brand: MOCK_BRANDS[0],
  },
  {
    id: 'book-002',
    title: 'A Suitable Boy',
    author: 'Vikram Seth',
    isbn: '978-0143028040',
    price: 599,
    stock: 12,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8091288-M.jpg',
    tentativeDeliveryDays: 4,
    category: MOCK_CATEGORIES[0],
    brand: MOCK_BRANDS[0],
  },
  {
    id: 'book-003',
    title: 'Midnight\'s Children',
    author: 'Salman Rushdie',
    isbn: '978-0099511892',
    price: 499,
    stock: 10,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8575708-M.jpg',
    tentativeDeliveryDays: 3,
    category: MOCK_CATEGORIES[2],
    brand: MOCK_BRANDS[1],
  },
  {
    id: 'book-004',
    title: 'Wings of Fire',
    author: 'A.P.J. Abdul Kalam',
    isbn: '978-8173711466',
    price: 199,
    stock: 30,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8739174-M.jpg',
    tentativeDeliveryDays: 2,
    category: MOCK_CATEGORIES[7],
    brand: MOCK_BRANDS[2],
  },
  {
    id: 'book-005',
    title: 'The White Tiger',
    author: 'Aravind Adiga',
    isbn: '978-1843547204',
    price: 299,
    stock: 15,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8379734-M.jpg',
    tentativeDeliveryDays: 3,
    category: MOCK_CATEGORIES[0],
    brand: MOCK_BRANDS[1],
  },
  {
    id: 'book-006',
    title: 'India After Gandhi',
    author: 'Ramachandra Guha',
    isbn: '978-0330396110',
    price: 699,
    stock: 8,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8739189-M.jpg',
    tentativeDeliveryDays: 5,
    category: MOCK_CATEGORIES[4],
    brand: MOCK_BRANDS[0],
  },
  {
    id: 'book-007',
    title: 'Atomic Habits (Indian Edition)',
    author: 'James Clear',
    isbn: '978-9353577018',
    price: 399,
    stock: 25,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/12849171-M.jpg',
    tentativeDeliveryDays: 2,
    category: MOCK_CATEGORIES[5],
    brand: MOCK_BRANDS[3],
  },
  {
    id: 'book-008',
    title: 'The Rozabal Line',
    author: 'Ashwin Sanghi',
    isbn: '978-8129115300',
    price: 275,
    stock: 20,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8091280-M.jpg',
    tentativeDeliveryDays: 3,
    category: MOCK_CATEGORIES[0],
    brand: MOCK_BRANDS[2],
  },
  {
    id: 'book-009',
    title: 'Ignited Minds',
    author: 'A.P.J. Abdul Kalam',
    isbn: '978-0143031611',
    price: 225,
    stock: 22,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8739168-M.jpg',
    tentativeDeliveryDays: 3,
    category: MOCK_CATEGORIES[5],
    brand: MOCK_BRANDS[0],
  },
  {
    id: 'book-010',
    title: 'Train to Pakistan',
    author: 'Khushwant Singh',
    isbn: '978-0143065883',
    price: 249,
    stock: 14,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8739187-M.jpg',
    tentativeDeliveryDays: 4,
    category: MOCK_CATEGORIES[2],
    brand: MOCK_BRANDS[0],
  },
  {
    id: 'book-011',
    title: 'The Immortals of Meluha',
    author: 'Amish Tripathi',
    isbn: '978-9380658742',
    price: 350,
    stock: 28,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8739183-M.jpg',
    tentativeDeliveryDays: 2,
    category: MOCK_CATEGORIES[0],
    brand: MOCK_BRANDS[3],
  },
  {
    id: 'book-012',
    title: 'Discovery of India',
    author: 'Jawaharlal Nehru',
    isbn: '978-0143031512',
    price: 450,
    stock: 9,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8739180-M.jpg',
    tentativeDeliveryDays: 5,
    category: MOCK_CATEGORIES[4],
    brand: MOCK_BRANDS[0],
  },
  {
    id: 'book-013',
    title: 'Clean Code (Indian Reprint)',
    author: 'Robert C. Martin',
    isbn: '978-8131773383',
    price: 699,
    stock: 11,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8091286-M.jpg',
    tentativeDeliveryDays: 4,
    category: MOCK_CATEGORIES[3],
    brand: MOCK_BRANDS[4],
  },
  {
    id: 'book-014',
    title: 'Chanakya\'s Chant',
    author: 'Ashwin Sanghi',
    isbn: '978-8129115317',
    price: 299,
    stock: 17,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8739195-M.jpg',
    tentativeDeliveryDays: 3,
    category: MOCK_CATEGORIES[0],
    brand: MOCK_BRANDS[2],
  },
  {
    id: 'book-015',
    title: 'Five Point Someone',
    author: 'Chetan Bhagat',
    isbn: '978-8129104298',
    price: 175,
    stock: 35,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8739163-M.jpg',
    tentativeDeliveryDays: 2,
    category: MOCK_CATEGORIES[0],
    brand: MOCK_BRANDS[2],
  },
  {
    id: 'book-016',
    title: 'Panchatantra Tales',
    author: 'Vishnu Sharma (Retold)',
    isbn: '978-8126413577',
    price: 149,
    stock: 40,
    coverImageUrl: 'https://covers.openlibrary.org/b/id/8379733-M.jpg',
    tentativeDeliveryDays: 2,
    category: MOCK_CATEGORIES[6],
    brand: MOCK_BRANDS[4],
  },
];

// ── Book Details ───────────────────────────────────────────────────────────
export const MOCK_BOOK_DETAILS: Record<string, BookDetail> = {};
MOCK_BOOKS.forEach(book => {
  MOCK_BOOK_DETAILS[book.id] = {
    ...book,
    description: `"${book.title}" by ${book.author} is a celebrated work that has captivated readers across India and the world. `
      + `This edition brings together a compelling narrative, richly drawn characters, and thought-provoking themes `
      + `that resonate deeply with readers of all backgrounds. A must-read for anyone who loves great literature.`,
    relatedProducts: MOCK_BOOKS.filter(b => b.id !== book.id && b.category?.id === book.category?.id).slice(0, 4),
  };
});

// ── Addresses ──────────────────────────────────────────────────────────────
export const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-001',
    label: 'Home',
    line1: '42, Shivaji Nagar',
    line2: 'Near SBI ATM',
    city: 'Pune',
    state: 'Maharashtra',
    postalCode: '411005',
    country: 'India',
    isDefault: true,
  },
  {
    id: 'addr-002',
    label: 'Office',
    line1: '15th Floor, Prestige Tech Park',
    line2: 'Marathahalli',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560037',
    country: 'India',
    isDefault: false,
  },
];

// ── Orders ─────────────────────────────────────────────────────────────────
const cancelDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-aabbccdd',
    status: 'confirmed',
    totalAmount: 1048,
    giftPointsUsed: 0,
    placedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    cancelDeadline,
  },
  {
    id: 'order-11223344',
    status: 'delivered',
    totalAmount: 724,
    giftPointsUsed: 50,
    placedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    cancelDeadline: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_PAYMENT: Payment = {
  id: 'pay-001',
  orderId: 'order-aabbccdd',
  method: 'upi',
  status: 'completed',
  confirmationRef: 'UPI-REF-8472931',
  amount: 1048,
  paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_ORDER_DETAILS: Record<string, OrderDetail> = {
  'order-aabbccdd': {
    ...MOCK_ORDERS[0],
    items: [
      { book: MOCK_BOOKS[6],  quantity: 1, unitPrice: MOCK_BOOKS[6].price },
      { book: MOCK_BOOKS[10], quantity: 2, unitPrice: MOCK_BOOKS[10].price },
    ],
    address: MOCK_ADDRESSES[0],
    payment: MOCK_PAYMENT,
  },
  'order-11223344': {
    ...MOCK_ORDERS[1],
    items: [
      { book: MOCK_BOOKS[3],  quantity: 1, unitPrice: MOCK_BOOKS[3].price },
      { book: MOCK_BOOKS[14], quantity: 3, unitPrice: MOCK_BOOKS[14].price },
    ],
    address: MOCK_ADDRESSES[1],
  },
};
