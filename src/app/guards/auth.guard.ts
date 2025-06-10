import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {NotificationService} from '../services/notification.service';
import {ClearanceLevelService} from '../services/clearance-level.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private clearanceLevelService: ClearanceLevelService,
  ) {
  }

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (!this.authService.isLoggedIn()) {
      await this.router.navigate(['/login']);
      this.authService.logout();
      return false;
    }

    const currentLevel = this.authService.clearanceLevel;
    const requiredFunctions: string = route.data['requiredFunctions'];
    if (requiredFunctions) {
      const hasPermission = this.clearanceLevelService.hasPermissionInProject(
        currentLevel,
        requiredFunctions,
      );
      if (!hasPermission) {
        this.notificationService.showNotification('Not Allowed', 'error');
        await this.router.navigate(['/login']);
        return false;
      }

      return true;
    }
    return true;
  }

}
