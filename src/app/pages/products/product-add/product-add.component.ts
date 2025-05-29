import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductService} from '../../../services/product.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Product} from '../../../interfaces/product.interface';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '../../../auth/auth.service';
import {NotificationService} from '../../../services/notification.service';

@Component({
  selector: 'app-product-add',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './product-add.component.html',
  styleUrl: './product-add.component.css'
})
export class ProductAddComponent implements OnInit {
  productForm: FormGroup;
  editMode = false;
  productId: number | null = null;

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
    })
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
}
