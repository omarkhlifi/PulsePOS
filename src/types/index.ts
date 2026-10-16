/**
 * PulsePOS — Modern Point of Sale Web Application
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

export type ProductCategory =
  | 'All'
  | 'Hot Beverages'
  | 'Cold Drinks'
  | 'Bakery'
  | 'Snacks'
  | 'Merch'
  | 'Combos';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  category: Exclude<ProductCategory, 'All'>;
  stock: number;
  image: string;
  description: string;
   accentColor?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
}

export type DiscountType = 'percentage' | 'fixed';

export interface Discount {
  type: DiscountType;
  value: number;
  label?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'wallet';

export interface PaymentDetails {
  method: PaymentMethod;
  amountTendered: number;
  changeDue: number;
  cardLastFour?: string;
  cardBrand?: string;
  walletProvider?: string;
  authCode: string;
}

export interface TransactionItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  timestamp: string;
  cashierName: string;
  customerLabel: string;
  items: TransactionItem[];
  subtotal: number;
  discount: Discount;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  payment: PaymentDetails;
}

export interface HeldOrder {
  id: string;
  customerLabel: string;
  createdAt: string;
  items: CartItem[];
  discount: Discount;
  note?: string;
}

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  cashierName: string;
  taxRate: number; // default 8.25
  lowStockThreshold: number; // default 5
}

