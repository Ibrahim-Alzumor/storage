import {Category} from './category.interface';
import {Unit} from './unit.interface';

export interface Product {
  id: number;
  name: string;
  stock: number;
  category: Category;
  images: string[];
  description: string;
  barcode: string;
  isEmpty?: boolean;
  stockDisplay?: string;
  unit: Unit;
}
