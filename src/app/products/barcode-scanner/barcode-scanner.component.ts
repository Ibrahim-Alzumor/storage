import {Component, OnInit} from '@angular/core';
import {ProductService} from '../product.service';
import {ReactiveFormsModule} from '@angular/forms';
import {Product} from '../product.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

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

    this.productService.addBarcodeToProduct(product.id, this.pendingBarcode).subscribe(() => {
      alert(`Barcode ${this.pendingBarcode} assigned to ${product.name}`);
      this.router.navigate(['/']);
    });
  }

  clearSearch(): void {
    this.router.navigate(['/'], {
      queryParams: {}
    });
  }

  private initializeProducts(): void {
    this.productService.getAll().subscribe(products => {
      this.products = products;
      this.loading = false;
    });
  }
}
