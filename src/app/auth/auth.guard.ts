import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NotificationService} from '../services/notification.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService, private notificationService: NotificationService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      this.authService.logout();
    }
    const minimumRequiredLevel = route.data['minimumRequiredLevel'] || 0;
    const currentLevel = this.authService.clearanceLevel;

    if (minimumRequiredLevel > currentLevel) {
      this.notificationService.showAccessDeniedNotification(minimumRequiredLevel);
      this.router.navigate(['']);
      return false;
    }

    return true;
  }

}

