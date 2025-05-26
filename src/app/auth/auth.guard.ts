import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService, private snackBar: MatSnackBar
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
      let message = '';
      if (minimumRequiredLevel === 0) {
        message = 'Only Employees are allowed!';
      } else if (minimumRequiredLevel === 1) {
        message = 'Only Associates and higher are allowed!';
      } else if (minimumRequiredLevel === 2) {
        message = 'Only Managers and higher are allowed!';
      }
      this.snackBar.open(message, 'Close', {
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['access-denied-snackbar']
      });

      this.authService.logout();
      return false;
    }
    return true;
  }
}

