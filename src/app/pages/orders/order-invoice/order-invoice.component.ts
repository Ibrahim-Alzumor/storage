import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Order} from '../../../interfaces/order.interface';
import {OrderService} from '../../../services/order.service';
import {NotificationService} from '../../../services/notification.service';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Product} from '../../../interfaces/product.interface';
import {ProductService} from '../../../services/product.service';

@Component({
  selector: 'app-order-invoice',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './order-invoice.component.html',
  styleUrl: './order-invoice.component.css'
})
export class OrderInvoiceComponent implements OnInit {
  orderId: number = 0;
  order: Order | null = null;
  products: Product[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {
  }

  getTotalItems(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((total, item) => total + item.quantity, 0);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const newOrderId = params['orderId'];
      if (newOrderId) {
        this.orderId = newOrderId;
        this.loadOrderData();
      }
    });
  }

  private loadOrderData() {
    this.orderService.getOneOrder(this.orderId).subscribe({
      next: (order) => {
        this.order = order;

        const productLoadPromises = order.items.map(item => {
          return new Promise<void>((resolve) => {
            this.productService.getOne(item.productId).subscribe({
              next: (product) => {
                item.product = product;
                resolve();
              },
              error: () => {
                item.product = {
                  id: item.productId,
                  name: 'Unknown Product',
                  stock: 0,
                  category: {id: '', name: 'Unknown Category'},
                  unit: {id: '', name: 'N/A'},
                  images: [],
                  description: '',
                  barcode: ''
                };
                resolve();
              }
            });
          });
        });

        Promise.all(productLoadPromises).then(() => {
          setTimeout(() => {
            window.print();
            this.router.navigate(['/orders'], {queryParams: {}});
          }, 500);
        });
      },
      error: () => {
        this.notificationService.showNotification('Error loading order data', 'error');
        this.router.navigate(['/orders']);
      }
    });
  }
}
