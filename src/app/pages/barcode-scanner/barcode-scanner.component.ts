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
import {CategoryService} from '../../services/category.service';

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
  currentPage = 1;
  pageSize = 50;
  totalProducts = 0;

  constructor(
    private productService: ProductService,
    protected route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private categoryService: CategoryService,
  ) {
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.pageSize);
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

  loadProducts(): void {
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      this.loading = true;
      if (name) {
        this.productService.getByName(name, this.currentPage, this.pageSize).subscribe(result => {
          this.products = result.items;
          this.totalProducts = result.total;
          this.loading = false;
        });
      } else {
        this.initializeProducts();
      }
    });
  }

  loadCategories(): void {
    this.categoryMap.clear();
    this.categoryService.getCategories().subscribe({
      next: categories => {
        categories.forEach(cat => this.categoryMap.set(cat.id, cat.name));
      },
      error: () => {
      }
    });
  }

  assignBarcodeToProduct(product: Product): void {
    if (!this.pendingBarcode) return;
    this.productService.addBarcodeToProduct(product.id, this.pendingBarcode).subscribe({
      next: () => {
        this.notificationService.showNotification(`Barcode ${this.pendingBarcode} assigned to ${product.name}`, 'success');
        this.router.navigate(['/']);
      },
      error: err => {
        this.notificationService.showNotification(err.error?.message || 'Error assigning barcode', 'error');
      }
    });
  }

  clearSearch(): void {
    this.router.navigate(['/'], {queryParams: {}});
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loading = true;
    this.loadProducts();
  }

  private initializeProducts(): void {
    this.productService.findAllValidBarcodes(this.currentPage, this.pageSize).subscribe(result => {
      this.products = result.items;
      this.totalProducts = result.total;
      this.loading = false;
    });
  }
}
