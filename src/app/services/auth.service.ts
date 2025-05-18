import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from './enviroment';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenkey = 'jwt_token';
  private clearanceKey = 'clearanceLevel';

  constructor(private http: HttpClient) {
  }

  get token() {
    return localStorage.getItem(this.tokenkey);
  }

  get clearanceLevel(): number {
    const level = Number(localStorage.getItem(this.clearanceKey));
    return isNaN(level) ? 0 : level;
  }


  login(email: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, {email, password}).pipe(
      tap(res => {
        localStorage.setItem(this.tokenkey, res.accessToken);
        localStorage.setItem(this.clearanceKey, res.clearanceLevel);
      })
    )
  }

  logout() {
    localStorage.removeItem(this.tokenkey);
    localStorage.removeItem(this.clearanceKey);
  }

  isLoggedIn() {
    return !!this.token;
  }
}
