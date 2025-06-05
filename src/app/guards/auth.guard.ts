import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {NotificationService} from '../services/notification.service';
import {ClearanceLevelService} from '../services/clearance-level.service';
import {Observable} from 'rxjs';
import {ClearanceLevel} from '../interfaces/clearance-level.interface';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  clearanceLevels$: Observable<ClearanceLevel[]>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private clearanceLevelService: ClearanceLevelService,
  ) {
    this.clearanceLevels$ = this.clearanceLevelService.clearanceLevels$;
  }

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      this.authService.logout();
      return false;
    }

    // const requiredFunctions: string = route.data['requiredFunctions'];
    // if (requiredFunctions) {
    //   const hasPermissionNavigation = await firstValueFrom(
    //     this.clearanceLevelService.canAccess(requiredFunctions)
    //   );
    const currentLevel = this.authService.clearanceLevel;
    const requiredFunctions: string = route.data['requiredFunctions'];
    if (requiredFunctions) {
      const hasPermission = await this.clearanceLevelService.checkPermission(
        currentLevel,
        requiredFunctions
      );
      if (!hasPermission) {
        this.notificationService.showNotification('Not Allowed', 'error');
        this.router.navigate(['']);
        return false;
      }

      return true;
    }
    return true;
  }

}
