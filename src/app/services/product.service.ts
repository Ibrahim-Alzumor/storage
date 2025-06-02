import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Product} from '../interfaces/product.interface';
import {map, Observable, of} from 'rxjs';
import {environment} from '../enviroments/enviroment';
import {catchError} from 'rxjs/operators';
import {Category} from '../interfaces/category.interface';
import {Unit} from '../interfaces/unit.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products`).pipe(
      map(products => products.map(this.cleanUpProduct))
    );
  }

  findAllValidBarcodes(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/find-barcodes`).pipe(
      map(products => products.map(this.cleanUpProduct))
    );
  }

  getByName(searchTerm: string): Observable<Product[]> {
    const params = new HttpParams().set('name', searchTerm.trim());
    return this.http.get<Product[]>(`${environment.apiUrl}/products/search`, {params}).pipe(
      map(products => products.map(this.cleanUpProduct))
    );
  }

  getOne(id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`).pipe(
      map(this.cleanUpProduct)
    );
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products`, product);
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/products/${id}`, product).pipe(
      map(this.cleanUpProduct)
    );
  }

  getUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${environment.apiUrl}/units`);
  }

  addUnit(unitName: string): Observable<Unit> {
    return this.http.post<Unit>(`${environment.apiUrl}/units`, {name: unitName})
      .pipe(
        catchError(error => {
          if (error.status === 201) {
            return of({id: '', name: unitName} as Unit);
          }
          throw error;
        })
      );
  }

  updateUnit(id: string, dto: { name: string }): Observable<Unit> {
    return this.http.patch<Unit>(`${environment.apiUrl}/units/${id}`, dto);
  }

  deleteUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/units/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }

  addCategory(categoryName: string): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/categories`, {name: categoryName})
      .pipe(
        catchError(error => {
          if (error.status === 201) {
            return of({id: '', name: categoryName} as Category);
          }
          throw error;
        })
      );
  }

  updateCategory(id: string, dto: { name: string }): Observable<Category> {
    return this.http.patch<Category>(`${environment.apiUrl}/categories/${id}`, dto);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`);
  }

  createOrder(order: { items: { productId: number; quantity: number }[] }): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/orders`, order);
  }

  addBarcodeToProduct(id: number, barcodeId: string): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/products/${id}/barcode`, {barcodeId});
  }

  getByBarcode(barcodeId: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/by-barcode/${barcodeId}`);
  }

  private cleanUpProduct(product: any): Product {
    const {id, name, stock, unitId, categoryId, images, description, barcode} = product;
    return {id, name, stock, unitId, categoryId, images, description, barcode};
  }
}
