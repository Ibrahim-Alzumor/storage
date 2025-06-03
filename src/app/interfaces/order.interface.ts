import {Product} from './product.interface';

export interface Order {
  id: number;
  userEmail: string;
  items: OrderItem[];
  timestamp: Date;
}

export interface OrderItem {
  productId: number;
  product?: Product;
  quantity: number;
}
