import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  register(user: any) {
    return this.http.post(`${environment.apiUrl}/auth/register`, user);
  }
}
