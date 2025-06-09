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
  clearanceLevel?: number;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  pageSize = 50;
  totalUsers = 0;
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

  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      this.loading = true;
      if (name) {
        this.userService.searchUsers(name, this.currentPage, this.pageSize).subscribe({
          next: res => {
            this.allUsers = res.items;
            this.users = res.items;
            this.totalUsers = res.total;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.notificationService.showNotification('Error loading users', 'error');
          }
        });
      } else {
        this.userService.getAllUsers(this.currentPage, this.pageSize).subscribe({
          next: res => {
            this.allUsers = res.items;
            this.users = res.items;
            this.totalUsers = res.total;
            this.loading = false;
          },
          error: () => {
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
    return this.clearanceLevelService.getClearanceLevelsValue().find(cl => cl.level === level)?.name || '';
  }

  editUser(email: string): void {
    this.router.navigate(['/register'], {queryParams: {email}});
  }

  sortUsers(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.users = [...this.users].sort((a, b) => {
      let cmp = 0;
      switch (column) {
        case 'firstName':
          cmp = (a.firstName || '').localeCompare(b.firstName || '');
          break;
        case 'lastName':
          cmp = (a.lastName || '').localeCompare(b.lastName || '');
          break;
        case 'email':
          cmp = a.email.localeCompare(b.email);
          break;
        case 'jobTitle':
          cmp = (a.jobTitle || '').localeCompare(b.jobTitle || '');
          break;
        case 'clearanceLevel':
          cmp = a.clearanceLevel - b.clearanceLevel;
          break;
      }
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loading = true;
    this.loadUsers();
  }
}
