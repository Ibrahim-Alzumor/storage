import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../enviroments/enviroment';
import {User} from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  register(user: User) {
    return this.http.post(`${environment.apiUrl}/auth/register`, user);
  }
}
