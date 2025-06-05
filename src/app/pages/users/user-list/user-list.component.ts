import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {User} from '../../../interfaces/user.interface';
import {UserService} from '../../../services/user.service';
import {NotificationService} from '../../../services/notification.service';
import {DraggableColumnDirective} from '../../../directives/draggable-column.directive';
import {ResizableColumnDirective} from '../../../directives/resizable-column.directive';
import {HasPermissionDirective} from '../../../directives/has-permission.directive';
import {USER_EDIT} from '../../../constants/function-permissions';
import {ClearanceLevelService} from '../../../services/clearance-level.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css',
    '../../../styles/directive-styles.css',
  ],
  standalone: true,
  imports: [
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DraggableColumnDirective,
    ResizableColumnDirective,
    HasPermissionDirective
  ]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  allUsers: User[] = [];
  loading = false;
  clearanceLevel: number | undefined;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  protected readonly USER_EDIT = USER_EDIT;

  constructor(
    private userService: UserService,
    protected route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private matIconRegistry: MatIconRegistry,
    private clearanceLevelService: ClearanceLevelService,
  ) {
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      this.loading = true;

      if (name) {
        this.userService.searchUsers(name).subscribe({
          next: (users) => {
            this.allUsers = users;
            this.users = users;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching users:', error);
            this.loading = false;
            this.notificationService.showNotification('Error loading users', 'error');
          }
        });
      } else {
        this.userService.getAllUsers().subscribe({
          next: (users) => {
            this.allUsers = users;
            this.users = users;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching users:', error);
            this.loading = false;
            this.notificationService.showNotification('Error loading users', 'error');
          }
        });
      }
    });
  }

  clearSearch(): void {
    this.router.navigate(['/users'], {queryParams: {}});
  }

  getClearanceLabel(level: number): string {
    const allLevels = this.clearanceLevelService.getClearanceLevelsValue();
    const match = allLevels.find(cl => cl.level === level);
    return match ? match.name : '';
  }

  editUser(email: string): void {
    this.router.navigate(['/register'], {queryParams: {email: email}});
  }

  sortUsers(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.users = [...this.users].sort((a, b) => {
      let comparison = 0;

      switch (column) {
        case 'firstName':
          comparison = (a.firstName || '').localeCompare(b.firstName || '');
          break;
        case 'lastName':
          comparison = (a.lastName || '').localeCompare(b.lastName || '');
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'jobTitle':
          comparison = (a.jobTitle || '').localeCompare(b.jobTitle || '');
          break;
        case 'clearanceLevel':
          comparison = a.clearanceLevel - b.clearanceLevel;
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
}
