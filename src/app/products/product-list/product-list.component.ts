import {Component, OnInit} from '@angular/core';
import {Product} from '../../interfaces/product.interface';
import {ProductService} from '../../services/product.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {NgOptimizedImage} from '@angular/common';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-product-list',
  imports: [
    MatButton,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatFormField,
    MatProgressSpinner,
    NgOptimizedImage,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isEditMode = false;
  productForm: FormGroup;
  loading = false;


  constructor(
    private productService: ProductService,
    private router: Router,
    protected route: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    this.productForm = this.createForm();
  }

  get productsFormArray(): FormArray {
    return this.productForm.get('products') as FormArray;
  }

  ngOnInit() {
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


  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.initializeForm();
    }
  }

  clearSearch(): void {
    this.router.navigate(['/'], {
      queryParams: {}
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
        if (Object.keys(changes).length > 1) {
          return firstValueFrom(this.productService.update(changes.id, changes));
        }
        return Promise.resolve();
      }).filter(promise => promise !== undefined);
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


  goToEdit(product: Product): void {
    this.router.navigate(['/add', product.id]);
  }

  hasImage(): boolean {
    return this.products.some(p => p.image);
  }

  deleteProduct(id: number): void {
    this.productService.delete(id).subscribe();
  }

  getChangedProperties(original: Product, updated: Product): PartialProduct {
    const changes: PartialProduct = {id: original.id};

    (Object.keys(original) as (keyof Product)[]).forEach(key => {
      if (key !== 'id' && original[key] !== updated[key]) {
        changes[key] = updated[key] as any;
      }
    });

    return changes;
  }

  private createForm(): FormGroup {
    return this.fb.group({
      products: this.fb.array([])
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

  private initializeForm(): void {
    const products = this.products.map(product => this.createProductFormGroup(product));

    this.productForm = this.fb.group({
      products: this.fb.array(products)
    });
  }
}

interface PartialProduct extends Partial<Product> {
  id: number;
}

