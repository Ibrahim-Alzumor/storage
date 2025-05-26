import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../enviroments/enviroment';
import {tap} from 'rxjs/operators';
import {jwtDecode} from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenkey = 'jwt_token';

  constructor(private http: HttpClient) {
  }

  get token() {
    const token = localStorage.getItem(this.tokenkey);
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          this.logout();
          return null;
        }
        return token;
      } catch (error) {
        this.logout();
        return null;
      }
    }
    return null;
  }

  get clearanceLevel(): number {
    const token = this.token;
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.clearanceLevel || 0;
      } catch (error) {
        return 0;
      }
    }
    return 0;
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, {email, password}).pipe(
      tap(res => {
        localStorage.setItem(this.tokenkey, res.accessToken);
      })
    )
  }

  logout() {
    localStorage.removeItem(this.tokenkey);
  }

  isLoggedIn() {
    return !!this.token;
  }
}
