import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Product} from '../interfaces/product.interface';
import {Observable} from 'rxjs';
import {environment} from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products`);
  }

  getByName(searchTerm: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/search?name=${encodeURIComponent(searchTerm)}`);
  }


  getOne(id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`);
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products`, product);
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/products/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`);
  }

  addStock(id: number, amount: number): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products/${id}/add-stock`, amount);
  }

  removeStock(id: number, amount: number): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products/${id}/remove-stock`, amount);
  }
}
