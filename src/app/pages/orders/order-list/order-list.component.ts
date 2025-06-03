import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Order} from '../../../interfaces/order.interface';
import {OrderService} from '../../../services/order.service';
import {AuthService} from '../../../auth/auth.service';
import {NotificationService} from '../../../services/notification.service';
import {DraggableColumnDirective} from '../../../directives/draggable-column.directive';
import {ResizableColumnDirective} from '../../../directives/resizable-column.directive';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css',
    '../../../styles/directive-styles.css',
  ],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DraggableColumnDirective,
    ResizableColumnDirective,
    ReactiveFormsModule,
  ]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  allOrders: Order[] = [];
  loading = false;
  clearanceLevel: number | undefined;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  filterForm: FormGroup;

  constructor(
    private orderService: OrderService,
    protected route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private matIconRegistry: MatIconRegistry,
    private fb: FormBuilder,
  ) {
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');

    this.filterForm = this.fb.group({
      start: [''],
      end: [''],
      email: [''],
    });
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      const start = params['start'];
      const end = params['end'];
      this.loading = true;

      this.filterForm.patchValue({
        start: start || '',
        end: end || '',
        email: email || ''
      });

      if (start || end || email) {
        this.orderService.getFilteredOrders(start || '', end || '', email || '').subscribe({
          next: (orders) => {
            this.allOrders = orders;
            this.orders = orders;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching filtered orders:', error);
            this.loading = false;
            this.notificationService.showNotification('Error loading orders', 'error');
          }
        });
      } else {
        this.orderService.getAllOrders().subscribe({
          next: (orders) => {
            this.allOrders = orders;
            this.orders = orders;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching orders:', error);
            this.loading = false;
            this.notificationService.showNotification('Error loading orders', 'error');
          }
        });
      }
    });
  }

  clearSearch(): void {
    this.router.navigate(['/orders'], {queryParams: {}});
  }

  applyFilters(): void {
    const {start, end, email} = this.filterForm.value;

    const queryParams: any = {};
    if (start) queryParams.start = start;
    if (end) queryParams.end = end;
    if (email) queryParams.email = email;

    this.router.navigate(['/orders'], {queryParams});
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.router.navigate(['/orders'], {queryParams: {}});
  }

  printInvoice(orderId: number): void {
    this.router.navigate(['/invoice'], {queryParams: {orderId}});
  }

  getOrderId(order: Order): number | string {
    return order.id;
  }

  sortOrders(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.orders = [...this.orders].sort((a, b) => {
      let comparison = 0;

      switch (column) {
        case 'id':
          if (a.id !== undefined && b.id !== undefined) {
            comparison = a.id - b.id;
          }
          break;
        case 'email':
          comparison = a.userEmail.localeCompare(b.userEmail);
          break;
        case 'date':
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          comparison = dateA - dateB;
          break;
        case 'items':
          comparison = a.items.length - b.items.length;
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  formatDate(timestamp: Date): string {
    return new Date(timestamp).toLocaleDateString();
  }
}
