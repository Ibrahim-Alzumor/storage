import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Product} from '../interfaces/product.interface';
import {map, Observable, of} from 'rxjs';
import {environment} from '../enviroments/enviroment';
import {catchError} from 'rxjs/operators';

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

  getUnits(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/units`);
  }

  addUnit(unit: string): Observable<string> {
    return this.http.post<string>(`${environment.apiUrl}/units`, {name: unit})
      .pipe(
        catchError(error => {
          if (error.status === 201) {
            return of(unit);
          }
          throw error;
        })
      );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/categories`);
  }

  addCategory(category: string): Observable<string> {
    return this.http.post<string>(`${environment.apiUrl}/categories`, {name: category})
      .pipe(
        catchError(error => {
          if (error.status === 201) {
            return of(category);
          }
          throw error;
        })
      );
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
    const {id, name, stock, unit, category, image, description, barcode} = product;
    return {id, name, stock, unit, category, image, description, barcode};
  }
}
