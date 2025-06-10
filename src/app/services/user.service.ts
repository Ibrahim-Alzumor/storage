import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../enviroments/enviroment';
import {User} from '../interfaces/user.interface';
import {Observable} from 'rxjs';
import {PaginationResult} from '../interfaces/pagination-result.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  register(user: User) {
    return this.http.post(`${environment.apiUrl}/auth/register`, user);
  }

  getByEmail(email: string) {
    const params = new HttpParams().set('email', email);
    return this.http.get<User>(`${environment.apiUrl}/users/by-email`, {params});
  }

  getAllUsers(page: number, limit: number): Observable<PaginationResult<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginationResult<User>>(
      `${environment.apiUrl}/users`,
      {params}
    );
  }

  searchUsers(
    name: string,
    page: number,
    limit: number
  ): Observable<PaginationResult<User>> {
    const params = new HttpParams()
      .set('name', name.trim())
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginationResult<User>>(
      `${environment.apiUrl}/users/search`,
      {params}
    );
  }

  updateUser(email: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${email}`, userData);
  }

  disableUser(email: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/users/${email}/disable`, {});
  }
}

