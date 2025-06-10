import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../enviroments/enviroment';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {jwtDecode} from "jwt-decode";
import {Login} from '../interfaces/login.interface';
import {Router} from '@angular/router';
import {NotificationService} from './notification.service';
import {throwError} from 'rxjs';
import {ClearanceLevelService} from './clearance-level.service';
import {ClearanceLevel} from '../interfaces/clearance-level.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'jwt_token';
  private clearanceLevelsKey = 'clearance_levels';

  constructor(private http: HttpClient, private router: Router, private notificationService: NotificationService, private clearanceLevelService: ClearanceLevelService,) {
  }

  get token() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken.exp && decodedToken.exp * 10000 < Date.now()) {
          this.logout();
          return null;
        }
        return decodedToken;
      } catch (error) {
        this.logout();
        return null;
      }
    }
    return null;
  }

  get clearanceLevel(): number {
    const decodedToken = this.token;
    if (decodedToken) {
      try {
        return decodedToken.clearanceLevel || 0;
      } catch (error) {
        return 0;
      }
    }
    return 0;
  }

  get getUserEmail(): string {
    const decodedToken = this.token;
    if (decodedToken) {
      try {
        return decodedToken.email || '';
      } catch (error) {
        return '';
      }
    }
    return '';
  }

  private set clearanceCache(levels: ClearanceLevel[]) {
    localStorage.setItem(this.clearanceLevelsKey, JSON.stringify(levels));
  }


  login(login: Login) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, login).pipe(
      tap(async res => {
        localStorage.setItem(this.tokenKey, res.accessToken);
      }),
      switchMap(() => this.clearanceLevelService.getClearanceLevels()),
      tap(clearanceLevels => {
        this.clearanceCache = clearanceLevels;
        this.router.navigate(['/']);
      }),
      catchError(err => {
        this.notificationService.showNotification(
          err.error?.message || 'Invalid credentials',
          'error'
        );
        return throwError(() => err);
      })
    )
  }


  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn() {
    return !!this.token;
  }
}
