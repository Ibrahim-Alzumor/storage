import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Product} from '../interfaces/product.interface';
import {map, Observable} from 'rxjs';
import {environment} from '../enviroments/enviroment';

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
    const {id, name, stock, category, image, description, barcode} = product;
    return {id, name, stock, category, image, description, barcode};
  }
}
