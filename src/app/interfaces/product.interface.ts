export interface Product {
  id: number;
  name: string;
  stock: number;
  categoryId: string;
  images: string[];
  description: string;
  barcode: string;
  isEmpty?: boolean;
  stockDisplay?: string;
  unitId: string;
}
