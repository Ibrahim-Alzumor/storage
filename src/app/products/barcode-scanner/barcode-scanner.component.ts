import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ProductService} from '../product.service';
import {ReactiveFormsModule} from '@angular/forms';
import {Product} from '../../interfaces/product.interface';
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
  @ViewChild('video', {static: true}) video!: ElementRef<HTMLVideoElement>;
  resultBuffer: string = '';
  lastScannedId: number | null = null;
  products: Product[] = [];
  loading = false;
  pendingBarcode: number | null = null;
  showAssignmentUI = false;

  constructor(
    private productService: ProductService,
    protected route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.listenToKeyPresses();
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

  listenToKeyPresses() {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const scannedId = Number(this.resultBuffer);
        if (!isNaN(scannedId) && scannedId !== this.lastScannedId) {
          this.lastScannedId = scannedId;

          this.productService.getByBarcode(scannedId).subscribe({
            next: (product: any) => {
              if (product) {
                this.handleScannedBarcode(scannedId);
              } else {
                this.askUserToAssignBarcode(scannedId);
              }
            },
            error: () => {
              this.askUserToAssignBarcode(scannedId);
            }
          });
        }
        this.resultBuffer = '';
      } else if (!isNaN(Number(e.key))) {
        this.resultBuffer += e.key;
      }
    });
  }


  handleScannedBarcode(barcodeId: number) {
    this.productService.getByBarcode(barcodeId).subscribe({
      next: (product: any) => {
        if (product) {
          this.productService.addStock(product.id).subscribe(() => {
            console.log(`Added stock for ${product.name}`);
            alert('added');
            this.listenToKeyPresses();
          });
        } else {
          this.askUserToAssignBarcode(barcodeId);
        }
      },
      error: () => this.askUserToAssignBarcode(barcodeId)
    });
  }

  askUserToAssignBarcode(barcodeId: number) {
    this.pendingBarcode = barcodeId;
    this.showAssignmentUI = true;
    this.loadProducts()
  }

  assignBarcodeToProduct(product: Product) {
    if (!this.pendingBarcode) return;
    this.productService.addBarcodeToProduct(product.id, this.pendingBarcode).subscribe(() => {
      alert(`Barcode ${this.pendingBarcode} assigned to ${product.name}`);
      this.pendingBarcode = null;
      this.showAssignmentUI = false;
      this.listenToKeyPresses();
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
      this.listenToKeyPresses();
    });
  }
}
