import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      this.authService.logout();
    }
    const requiredLevel = route.data['requiredLevel'] || 0;
    const currentLevel = this.authService.clearanceLevel;

    if (requiredLevel > currentLevel) {
      if (requiredLevel === 0) {
        alert('Only Employees are allowed!!');
      } else if (requiredLevel === 1) {
        alert('Only Associates and higher are allowed!!');
      } else if (requiredLevel === 2) {
        alert('Only Managers and higher are allowed!!');
      }
      this.router.navigate(['/login']);
      this.authService.logout();
      return false;
    }
    return true;
  }
}

