import {Component, HostListener, OnInit,} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {firstValueFrom} from 'rxjs';

import {Product} from '../../../interfaces/product.interface';
import {ProductService} from '../../../services/product.service';
import {AuthService} from '../../../auth/auth.service';
import {BarcodeService} from '../../../services/barcode.service';
import {NotificationService} from '../../../services/notification.service';
import {ResizableColumnDirective} from '../../../directives/resizable-column.directive';
import {DraggableColumnDirective} from '../../../directives/draggable-column.directive';
import {MatSelectModule} from '@angular/material/select';
import {Unit} from '../../../interfaces/unit.interface';
import {Category} from '../../../interfaces/category.interface';
import {UnitService} from '../../../services/unit.service';
import {CategoryService} from '../../../services/category.service';
import {OrderService} from '../../../services/order.service';
import {UserService} from '../../../services/user.service';
import {Order} from '../../../interfaces/order.interface';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatProgressSpinner,
    MatIcon,
    MatMenuModule,
    ResizableColumnDirective,
    DraggableColumnDirective,
    MatSelectModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css',
    '../../../styles/directive-styles.css',
  ]
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
  isOrderMode = false;
  orderItems: Map<number, number> = new Map();
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  availableUnits: Unit[] = [];
  availableCategories: Category[] = [];
  selectedCategoryId: string | null = null;
  selectedCategoryName: string | null = null;
  selectedUnitId: string | null = null;
  selectedUnitName: string | null = null;
  allProducts: Product[] = [];
  showCategoryDropdown = false;
  showUnitDropdown = false;
  categoryMap: Map<string, string> = new Map();
  unitMap: Map<string, string> = new Map();
  showExpandedImages = false;
  expandedImages: string[] = [];
  expandedProductName = '';
  currentImageIndex = 0;

  constructor(
    private productService: ProductService,
    private router: Router,
    protected route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private barcodeService: BarcodeService,
    private notificationService: NotificationService,
    private matIconRegistry: MatIconRegistry,
    private unitService: UnitService,
    private categoryService: CategoryService,
    private orderService: OrderService,
    private userService: UserService,
  ) {
    this.productForm = this.fb.group({
      products: this.fb.array([])
    });
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }

  get productsFormArray(): FormArray {
    return this.productForm.get('products') as FormArray;
  }

  get categoryNames(): string[] {
    return Array.from(this.categoryMap.values());
  }

  get unitNames(): string[] {
    return Array.from(this.unitMap.values());
  }

  ngOnInit() {
    this.loadProductsNotEdit();
    this.initializeBarcodeScanner();
  }

  expandImages(images: string[], productName: string): void {
    if (images && images[0] == '') {
      return
    }

    this.expandedImages = images;
    this.expandedProductName = productName;
    this.currentImageIndex = 0;
    this.showExpandedImages = true;
  }

  closeExpandedImages(): void {
    this.showExpandedImages = false;
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.expandedImages.length - 1) {
      this.currentImageIndex++;
    }
  }

  loadAvailableOptions() {
    this.unitService.getUnits().subscribe({
      next: (units) => {
        this.availableUnits = units;
      },
      error: () => {
        console.log('Failed to load units');
      }
    });

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.availableCategories = categories;
      },
      error: () => {
        console.log('Failed to load categories');
      }
    });
  }

  sortProducts(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.products = [...this.products].sort((a, b) => {
      let comparison = 0;

      switch (column) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'unit':
          comparison = (a.unit.name || '').localeCompare(b.unit.name || '');
          break;
        case 'category':
          comparison = (a.category.name || '').localeCompare(b.category.name || '');
          break;
        case 'description':
          comparison = (a.description || '').localeCompare(b.description || '');
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getClearanceLevel(): number {
    return this.clearanceLevel = this.authService.clearanceLevel;
  }

  loadProductsNotEdit() {
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      this.loading = true;

      if (name) {
        this.productService.getByName(name).subscribe(products => {
          this.allProducts = products;
          this.applyFilters();
          this.extractCategories();
          this.extractUnits();
          this.loading = false;
        });
      } else {
        this.initializeProducts();
        this.loading = false;
      }
    });
  }

  deleteProduct(id: number): void {
    this.productService.delete(id).subscribe({
      next: () => {
        this.notificationService.showNotification('Product Deleted!', 'success');
        this.loadProductsNotEdit();
      },
      error: err => this.notificationService.showNotification(err.error?.message || 'Error deleting product', 'error')
    });
  }

  clearSearch(): void {
    this.router.navigate(['/'], {queryParams: {}});
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.loadProductsEdit();
      this.loadAvailableOptions();
    } else {
      this.loadProductsNotEdit();
    }
  }

  loadProductsEdit() {
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      this.loading = true;
      if (name) {
        this.productService.getByName(name).subscribe({
          next: (products) => {
            this.allProducts = products;
            this.applyFilters();
            this.extractCategories();
            this.extractUnits();
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
            this.allProducts = products;
            this.applyFilters();
            this.extractCategories();
            this.extractUnits();
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

  extractUnits(): void {
    this.unitMap.clear();
    this.unitService.getUnits().subscribe({
      next: (units) => {
        units.forEach(unit => this.unitMap.set(unit.id, unit.name));
      },
      error: () => {
        console.log('Failed to load units');
      }
    });
  }

  saveChanges(): void {
    const productsToUpdate = this.productsFormArray.controls
      .map((control, index) => {
        this.processImagesBeforeSave();
        const formValues = control.value;
        const originalProduct = this.products[index];

        const changes: Partial<Product> = {};

        switch (true) {
          case formValues.name !== originalProduct.name:
            changes.name = formValues.name;
            break;

          case formValues.stock !== originalProduct.stock:
            changes.stock = formValues.stock;
            break;

          case formValues.unitId !== originalProduct.unit.id:
            const unit = this.availableUnits.find(u => u.id === formValues.unitId);
            if (unit) changes.unit = unit;
            break;

          case formValues.categoryId !== originalProduct.category.id:
            const category = this.availableCategories.find(c => c.id === formValues.categoryId);
            if (category) changes.category = category;
            break;

          case formValues.images !== originalProduct.images:
            changes.images = formValues.images;
            break;
        }

        return {
          id: originalProduct.id,
          changes: Object.keys(changes).length > 0 ? changes : null
        };
      })
      .filter(item => item.changes !== null);

    if (productsToUpdate.length === 0) {
      this.notificationService.showNotification('No changes to save', 'info');
      return;
    }

    Promise.all(
      productsToUpdate.map(item =>
        firstValueFrom(this.productService.update(item.id, item.changes!))
      )
    )
      .then(() => {
        this.notificationService.showNotification('Products updated successfully', 'success');
        this.isEditMode = false;
        this.loadProductsNotEdit();
      })
      .catch(error => {
        this.notificationService.showNotification('Error updating products', 'error');
        console.error('Error updating products:', error);
      });
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
      this.notificationService.showNotification('All additions confirmed', 'success');
      this.scannedAdditions.clear();
      this.hasStartedScanning = false;
      this.loadProductsNotEdit();
      this.showPendingChanges = false;
    })
      .catch(error => {
        this.notificationService.showNotification('Error confirming additions: ' + (error as Error).message, 'error');
      });
  }

  getInProgressAdditions(): Product[] {
    return this.products.filter(p => this.scannedAdditions.has(p.id))
      .map(p => ({
        ...p, stockDisplay: `${p.stock} + ${this.scannedAdditions.get(p.id)}`
      }));
  }

  filterByCategory(categoryName: string | null): void {
    this.selectedCategoryName = categoryName;
    this.showCategoryDropdown = false;

    if (!categoryName) {
      this.selectedCategoryId = null;
      this.products = [...this.allProducts];
    } else {
      const category = this.availableCategories.find(c => c.name === categoryName);
      this.selectedCategoryId = category?.id || null;

      this.products = this.allProducts.filter(product =>
        product.category && product.category.name === categoryName
      );
    }
  }

  filterByUnit(unitName: string | null): void {
    this.selectedUnitName = unitName;
    this.showUnitDropdown = false;

    if (!unitName) {
      this.selectedUnitId = null;
      this.products = [...this.allProducts];
    } else {
      const unit = this.availableUnits.find(u => u.name === unitName);
      this.selectedUnitId = unit?.id || null;

      this.products = this.allProducts.filter(product =>
        product.unit && product.unit.name === unitName
      );
    }
  }


  applyFilters(): void {
    if (!this.selectedCategoryId && !this.selectedUnitId) {
      this.products = [...this.allProducts].map(p => {
        const pending = this.scannedAdditions.get(p.id) || 0;
        return {
          ...p,
          stockDisplay: pending > 0 ? `${p.stock} + ${pending}` : `${p.stock}`
        };
      });
    } else if (this.selectedCategoryId && !this.selectedUnitId) {
      this.products = this.allProducts
        .filter(product => product.category.id === this.selectedCategoryId)
        .map(p => {
          const pending = this.scannedAdditions.get(p.id) || 0;
          return {
            ...p,
            stockDisplay: pending > 0 ? `${p.stock} + ${pending}` : `${p.stock}`
          };
        });
    } else if (!this.selectedCategoryId && this.selectedUnitId) {
      this.products = this.allProducts
        .filter(product => product.unit.id === this.selectedUnitId)
        .map(p => {
          const pending = this.scannedAdditions.get(p.id) || 0;
          return {
            ...p,
            stockDisplay: pending > 0 ? `${p.stock} + ${pending}` : `${p.stock}`
          };
        });
    }
  }

  toggleCategoryDropdown(event: Event): void {
    event.stopPropagation();
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  toggleUnitDropdown(event: Event): void {
    event.stopPropagation();
    this.showUnitDropdown = !this.showUnitDropdown;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.barcodeService.handleKey(event);
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.showCategoryDropdown = false;
    this.showUnitDropdown = false;
  }

  toggleOrderMode(): void {
    this.isOrderMode = !this.isOrderMode;
    if (this.isOrderMode) {
      this.loadProductsNotEdit();
    } else {
      this.orderItems.clear();
    }
  }

  addToOrder(product: Product): void {
    const current = this.orderItems.get(product.id) || 0;
    if (current < product.stock) {
      this.orderItems.set(product.id, current + 1);
    }
  }

  removeFromOrder(product: Product): void {
    const current = this.orderItems.get(product.id) || 0;
    if (current > 1) {
      this.orderItems.set(product.id, current - 1);
    } else {
      this.orderItems.delete(product.id);
    }
  }

  submitOrder(): void {
    const items = Array.from(this.orderItems.entries()).map(([productId, quantity]) => ({productId, quantity}));
    if (items.length === 0) {
      this.notificationService.showNotification('Please add items to order', 'warning');
      return;
    }

    const userEmail = this.authService.getUserEmail;
    this.userService.getByEmail(userEmail).subscribe({
      next: (user) => {
        const order: Order = {
          id: 0,
          userEmail: user.email,
          items: items,
          timestamp: new Date(),
        };

        this.orderService.createOrder(order).subscribe({
          next: () => {
            this.notificationService.showNotification('Order Submitted!', 'success');
            this.orderItems.clear();
            this.isOrderMode = false;
            this.loadProductsNotEdit();
          },
          error: (err) => this.notificationService.showNotification(err.error?.message || 'Error submitting order', 'error')
        });
      },
      error: (err) => {
        this.notificationService.showNotification('Error getting user information', 'error');
        console.error(err);
      }
    });
  }

  extractCategories(): void {
    this.categoryMap.clear();
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        categories.forEach(cat => this.categoryMap.set(cat.id, cat.name));
      },
      error: () => {
        console.log('Failed to load categories');
      }
    });
  }

  initializeProducts(): void {
    this.productService.getAll().subscribe(products => {
      this.allProducts = products;
      this.applyFilters();
      this.extractCategories();
      this.extractUnits();
    });
  }

  processImagesBeforeSave(): void {
    this.productsFormArray.controls.forEach(productGroup => {
      const imagesValue = productGroup.get('images')?.value;

      if (typeof imagesValue === 'string' && imagesValue) {
        const imageUrls = imagesValue
          .split(',')
          .map(url => url.trim())
          .filter(url => url !== '');
        productGroup.get('images')?.setValue(imageUrls.length > 0 ? imageUrls : []);
      }
    });
  }

  getImage(product: Product): string {
    if (product.images && product.images[0] != '') {
      return product.images[0]
    }

    return 'https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg'
  }

  private initializeForm(): void {
    const products = this.products.map(product => this.createProductFormGroup(product));
    this.productForm = this.fb.group({
      products: this.fb.array(products)
    });
  }

  private createProductFormGroup(product: Product): FormGroup {
    let imagesValue = '';
    if (product.images && Array.isArray(product.images)) {
      imagesValue = product.images.join(', ');
    } else {
      imagesValue = product.images;
    }

    return this.fb.group({
      id: [product.id],
      name: [product.name, [Validators.required, Validators.maxLength(50)]],
      stock: [product.stock, [Validators.required, Validators.min(0)]],
      unitId: [product.unit.id, Validators.required],
      categoryId: [product.category.id, Validators.required],
      images: [imagesValue],
      description: [product.description, Validators.required]
    });
  }
}
