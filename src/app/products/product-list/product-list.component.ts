import {
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {NgOptimizedImage} from '@angular/common';
import {firstValueFrom} from 'rxjs';

import {Product} from '../product.interface';
import {ProductService} from '../product.service';
import {AuthService} from '../../auth/auth.service';
import {BarcodeService} from '../barcode.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatProgressSpinner,
    NgOptimizedImage
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  productForm: FormGroup;
  isEditMode = false;
  loading = false;
  clearanceLevel: number | undefined;
  scannedAdditions: Map<number, number> = new Map();
  hasStartedScanning = false;
  showPendingChanges = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    protected route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private barcodeService: BarcodeService
  ) {
    this.productForm = this.fb.group({
      products: this.fb.array([])
    });
  }

  get productsFormArray(): FormArray {
    return this.productForm.get('products') as FormArray;
  }

  ngOnInit() {
    this.authService.isLoggedIn();
    this.loadProductsNotEdit()
    this.initializeBarcodeScanner();
    this.barcodeService.startListening();
  }


  initializeBarcodeScanner(): void {
    this.barcodeService.startListening();

    this.barcodeService.scannedBarcode$.subscribe(barcode => {
      this.hasStartedScanning = true;

      this.productService.getByBarcode(barcode).subscribe({
        next: (product) => {
          if (product) {
            const current = this.scannedAdditions.get(product.id) || 0;
            const updatedAmount = current + 1;
            this.scannedAdditions.set(product.id, updatedAmount);

            const foundProduct = this.products.find(p => p.id === product.id);
            if (foundProduct) {
              foundProduct.stockDisplay = `${foundProduct.stock} + ${updatedAmount}`;
            }

            this.showPendingChanges = true;
            this.barcodeService.startListening();
          } else {
            this.router.navigate(['/barcode'], {queryParams: {barcode}});
          }
        },
        error: () => {
          this.router.navigate(['/barcode'], {queryParams: {barcode}});
        }
      });
    });
  }


  confirmScannedAdditions(): void {
    const updateRequests = [];

    for (const [productId, addedAmount] of this.scannedAdditions.entries()) {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        const newStock = product.stock + addedAmount;
        updateRequests.push(
          firstValueFrom(this.productService.update(product.id, {stock: newStock}))
        );
      }
    }
    Promise.all(updateRequests).then(() => {
      alert('All additions confirmed');
      this.scannedAdditions.clear();
      this.hasStartedScanning = false;
      this.loadProductsNotEdit();
      this.showPendingChanges = false;
    })
      .catch(error => {
        alert('Error confirming additions: ' + (error as Error).message);
      })
  }

  getInProgressAdditions(): Product[] {
    return this.products.filter(p => this.scannedAdditions.has(p.id))
      .map(p => ({
        ...p, stockDisplay: `${p.stock} + ${this.scannedAdditions.get(p.id)}`
      }));
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.barcodeService.handleKey(event);
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.loadProductsEdit();
    } else {
      this.loadProductsNotEdit();
    }
  }

  clearSearch(): void {
    this.router.navigate(['/'], {queryParams: {}});
  }

  goToEdit(product: Product): void {
    this.router.navigate(['/add', product.id]);
  }

  hasImage(): boolean {
    return this.products.some(p => p.image);
  }

  deleteProduct(id: number): void {
    this.productService.delete(id).subscribe({
      next: () => {
        alert('Product Deleted!');
        this.loadProductsNotEdit();
      },
      error: err => alert(err.error?.message || 'Error deleting product')
    });
  }

  getClearanceLevel(): number {
    return this.clearanceLevel = this.authService.clearanceLevel;
  }

  loadProductsEdit() {
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      this.loading = true;
      if (name) {
        this.productService.getByName(name).subscribe({
          next: (products) => {
            this.products = products;
            this.initializeForm();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching products:', error);
            this.loading = false;
          }
        });
      } else {
        this.productService.getAll().subscribe({
          next: (products) => {
            this.products = products;
            this.initializeForm();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching products:', error);
            this.loading = false;
          }
        });
      }
    });
  }

  loadProductsNotEdit() {
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      this.loading = true;

      if (name) {
        this.productService.getByName(name).subscribe(products => {
          this.products = products.map(p => {
            const pending = this.scannedAdditions.get(p.id) || 0;
            return {
              ...p,
              stockDisplay: pending > 0 ? `${p.stock} + ${pending}` : `${p.stock}`
            };
          });
          this.loading = false;
        });
      } else {
        this.initializeProducts();
        this.loading = false;
      }
    });
  }


  async saveChanges(): Promise<void> {
    if (!this.productForm.valid) {
      alert('Please fix the form errors before saving');
      return;
    }

    try {
      const updatedProducts = this.productsFormArray.value as Product[];
      const updatePromises = updatedProducts.map((updatedProduct, index) => {
        const originalProduct = this.products[index];
        const changes = this.getChangedProperties(originalProduct, updatedProduct);
        if (Object.keys(changes).length > 1 && changes.id) {
          return firstValueFrom(this.productService.update(changes.id, changes));
        }
        return Promise.resolve();
      }).filter(p => p !== undefined);

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        alert('All changes saved successfully');
      }

      this.isEditMode = false;
      this.products = await firstValueFrom(this.productService.getAll());
    } catch (error) {
      alert('Error saving changes: ' + (error as Error).message);
    }
  }

  getChangedProperties(original: Product, updated: Product): Partial<Product> {
    const changes: Partial<Product> = {id: original.id};

    for (const key of Object.keys(original) as (keyof Product)[]) {
      if (key !== 'id' && original[key] !== updated[key]) {
        (changes as Record<keyof Product, Product[keyof Product]>)[key] = updated[key];
      }
    }

    return changes;
  }

  private initializeForm(): void {
    const products = this.products.map(product => this.createProductFormGroup(product));
    this.productForm = this.fb.group({
      products: this.fb.array(products)
    });
  }

  private initializeProducts(): void {
    this.productService.getAll().subscribe(products => {
      this.products = products.map(p => {
        const pending = this.scannedAdditions.get(p.id) || 0;
        return {
          ...p,
          stockDisplay: pending > 0 ? `${p.stock} + ${pending}` : `${p.stock}`
        };
      });
    });
  }


  private createProductFormGroup(product: Product): FormGroup {
    return this.fb.group({
      id: [product.id],
      name: [product.name, [Validators.required, Validators.maxLength(50)]],
      stock: [product.stock, [Validators.required, Validators.min(0)]],
      category: [product.category, Validators.required],
      image: [product.image],
      description: [product.description, Validators.required]
    });
  }
}
