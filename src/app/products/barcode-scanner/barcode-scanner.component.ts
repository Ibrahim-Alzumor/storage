import {Component, OnInit} from '@angular/core';
import {ProductService} from '../product.service';
import {ReactiveFormsModule} from '@angular/forms';
import {Product} from '../product.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatProgressSpinner
  ],
  templateUrl: './barcode-scanner.component.html',
  styleUrl: './barcode-scanner.component.css'
})
export class BarcodeScannerComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  pendingBarcode: string | null = null;

  constructor(
    private productService: ProductService,
    protected route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    const barcode = this.route.snapshot.queryParamMap.get('barcode');
    if (!barcode) {
      this.router.navigate(['/']);
      return;
    }
    this.pendingBarcode = barcode;
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

  assignBarcodeToProduct(product: Product): void {
    if (!this.pendingBarcode) return;

    this.productService.addBarcodeToProduct(product.id, this.pendingBarcode).subscribe({
      next: () => {
        this.showNotification(`Barcode ${this.pendingBarcode} assigned to ${product.name}`, 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.showNotification(err.error?.message || 'Error assigning barcode', 'error');
      }
    });
  }

  clearSearch(): void {
    this.router.navigate(['/'], {
      queryParams: {}
    });
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const panelClass = [`${type}-snackbar`];

    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass
    });
  }

  private initializeProducts(): void {
    this.productService.getAll().subscribe(products => {
      this.products = products;
      this.loading = false;
    });
  }
}
