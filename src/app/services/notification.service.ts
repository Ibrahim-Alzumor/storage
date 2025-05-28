import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'access-denied';

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
}
