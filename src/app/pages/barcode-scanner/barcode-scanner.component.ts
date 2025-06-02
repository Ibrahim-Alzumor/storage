import {Component, OnInit} from '@angular/core';
import {ProductService} from '../../services/product.service';
import {ReactiveFormsModule} from '@angular/forms';
import {Product} from '../../interfaces/product.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {NotificationService} from '../../services/notification.service';
import {DraggableColumnDirective} from '../../directives/draggable-column.directive';
import {ResizableColumnDirective} from '../../directives/resizable-column.directive';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatProgressSpinner,
    DraggableColumnDirective,
    ResizableColumnDirective
  ],
  templateUrl: './barcode-scanner.component.html',
  styleUrl: './barcode-scanner.component.css'
})
export class BarcodeScannerComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  pendingBarcode: string | null = null;
  categoryMap: Map<string, string> = new Map();

  constructor(
    private productService: ProductService,
    protected route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    const barcode = this.route.snapshot.queryParamMap.get('barcode');
    if (!barcode) {
      this.router.navigate(['/']);
      return;
    }
    this.pendingBarcode = barcode;
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts() {
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      this.loading = true;
      if (name) {
        this.productService.getByName(name).subscribe(products => {
          this.products = products;
          this.loading = false;
        });
      } else {
        this.initializeProducts();
      }
    });
  }

  loadCategories(): void {
    this.categoryMap.clear();
    this.productService.getCategories().subscribe({
      next: (categories) => {
        categories.forEach(cat => this.categoryMap.set(cat.id, cat.name));
      },
      error: () => {
        console.log('Failed to load categories');
      }
    });
  }

  getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return 'Not categorized';
    return this.categoryMap.get(categoryId) || 'Unknown category';
  }

  assignBarcodeToProduct(product: Product): void {
    if (!this.pendingBarcode) return;

    this.productService.addBarcodeToProduct(product.id, this.pendingBarcode).subscribe({
      next: () => {
        this.notificationService.showNotification(`Barcode ${this.pendingBarcode} assigned to ${product.name}`, 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.notificationService.showNotification(err.error?.message || 'Error assigning barcode', 'error');
      }
    });
  }

  clearSearch(): void {
    this.router.navigate(['/'], {
      queryParams: {}
    });
  }

  private initializeProducts(): void {
    this.productService.findAllValidBarcodes().subscribe(products => {
      this.products = products;
      this.loading = false;
    });
  }
}
