import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductService} from '../../../services/product.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Product} from '../../../interfaces/product.interface';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '../../../auth/auth.service';
import {NotificationService} from '../../../services/notification.service';
import {MatIcon} from '@angular/material/icon';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';

@Component({
  selector: 'app-product-add',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatIcon,
    MatSelect,
    MatOption
  ],
  templateUrl: './product-add.component.html',
  styleUrl: './product-add.component.css'
})
export class ProductAddComponent implements OnInit {
  productForm: FormGroup;
  editMode = false;
  productId: number | null = null;
  availableUnits: string[] = [];
  availableCategories: string[] = [];
  newUnit: string = '';
  newCategory: string = '';
  unitDialogOpen = false;
  categoryDialogOpen = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      category: ['', Validators.required],
      image: [''],
      description: ['', Validators.required],
    })
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        this.productId = +params['id'];
        this.productService.getOne(this.productId).subscribe(product => {
          this.productForm.patchValue(product)
        })
      }
    });
    this.productService.getUnits().subscribe({
      next: (units) => {
        if (units && units.length) {
          this.availableUnits = units;
        }
      },
      error: () => {
        console.log('failed to load units');
      }
    });

    this.productService.getCategories().subscribe({
      next: (categories) => {
        if (categories && categories.length) {
          this.availableCategories = categories;
        }
      },
      error: () => {
        console.log('Failed to load categories');
      }
    });

    this.authService.isLoggedIn();
  }

  onSubmit(): void {
    if (!this.productForm.valid) {
      this.notificationService.showNotification('Not valid product form', 'error');
      return;
    }

    const product: Product = {id: this.productId || 0, ...this.productForm.value};

    if (this.editMode && this.productId) {
      this.productService.update(this.productId, this.productForm.value).subscribe({
        next: () => {
          this.notificationService.showNotification('Product Updated!', 'success');
          this.router.navigate(['/']);
        },
        error: err => this.notificationService.showNotification(err.error?.message || 'Error updating product', 'error'),
      })
    } else {
      this.productService.create(product).subscribe({
        next: () => {
          this.notificationService.showNotification('Product Added!', 'success');
          this.router.navigate(['/']);
        },
        error: err => this.notificationService.showNotification(err.error?.message || 'Error adding product', 'error'),
      })
    }
  }

  addNewUnit(): void {
    if (!this.newUnit || this.newUnit.trim() === '') {
      this.notificationService.showNotification('Unit name cannot be empty', 'error');
      return;
    }

    if (this.availableUnits.includes(this.newUnit)) {
      this.notificationService.showNotification('Unit already exists', 'warning');
      return;
    }

    this.productService.addUnit(this.newUnit).subscribe({
      next: (response) => {
        console.log('Unit added successfully:', response);
        this.availableUnits.push(this.newUnit);
        this.productForm.get('unit')?.setValue(this.newUnit);
        this.newUnit = '';
        this.notificationService.showNotification('New unit added', 'success');
      },
      error: (error) => {
        console.error('Error adding unit:', error);
        this.notificationService.showNotification(`Failed to add new unit: ${error.message || 'Unknown error'}`, 'error');
      },
      complete: () => {
        console.log('Unit addition operation completed');
      }
    });
  }

  addNewCategory(): void {
    if (!this.newCategory || this.newCategory.trim() === '') {
      this.notificationService.showNotification('Category name cannot be empty', 'error');
      return;
    }

    if (this.availableCategories.includes(this.newCategory)) {
      this.notificationService.showNotification('Category already exists', 'warning');
      return;
    }

    this.productService.addCategory(this.newCategory).subscribe({
      next: (response) => {
        console.log('Category added successfully:', response);
        this.availableCategories.push(this.newCategory);
        this.productForm.get('category')?.setValue(this.newCategory);
        this.newCategory = '';
        this.notificationService.showNotification('New category added', 'success');
      },
      error: (error) => {
        console.error('Error adding category:', error);
        this.notificationService.showNotification(`Failed to add new category: ${error.message || 'Unknown error'}`, 'error');
      },
      complete: () => {
        console.log('Category addition operation completed');
      }
    });
  }
}
