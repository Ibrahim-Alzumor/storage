import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../enviroments/enviroment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Order} from '../interfaces/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private http: HttpClient,
  ) {
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders`, order);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders`);
  }

  getOneOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${id}`);
  }

  getFilteredOrders(start: string, end: string, email: string): Observable<Order[]> {
    let params = new HttpParams();

    if (start) {
      params = params.set('start', start);
    }

    if (end) {
      params = params.set('end', end);
    }

    if (email) {
      params = params.set('email', email);
    }

    return this.http.get<Order[]>(`${environment.apiUrl}/orders/filtered`, {params});
  }

  // leaving for later
  // updateOrder(orderId: number, orderData: Partial<Order>): Observable<Order> {
  //   return this.http.put<Order>(`${environment.apiUrl}/orders/${orderId}`, orderData);
  // }
}
