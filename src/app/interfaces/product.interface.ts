export interface Product {
  id: number;
  name: string;
  stock: number;
  category: string;
  image: string;
  description: string;
  barcode: number;
  isEmpty?: boolean;
}
