import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) {
  }

  showNotification(message: string, type: NotificationType): void {
    const panelClass = [`${type}-snackbar`];

    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass
    });
  }

  showAccessDeniedNotification(level: number): void {
    let message = '';
    switch (level) {
      case 0:
        message = 'Only Employees are allowed!';
        break;
      case 1:
        message = 'Only Associates and higher are allowed!';
        break;
      case 2:
        message = 'Only Managers and higher are allowed!';
        break;
      case 3:
        message = 'Only Owners are allowed!';
        break;
    }
    this.showNotification(message, 'error');
  }
}
