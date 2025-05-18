import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductService} from '../../services/product.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Product} from '../../interfaces/product.interface';

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  editMode = false;
  productId: number | null = null;

  constructor(private fb: FormBuilder, private productSvc: ProductService, private router: Router, private route: ActivatedRoute) {
    this.productForm = this.fb.group({
      name: ['', Validators.required, Validators.maxLength(50)],
      stock: [0, Validators.required, Validators.min(0)],
      category: [0, Validators.required],
      image: [''],
      description: ['', Validators.required],
    })
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        this.productId = +params['id'];
        this.productSvc.getOne(this.productId).subscribe(product => {
          this.productForm.patchValue(product)
        })
      }
    })
  }

  onSubmit(): void {
    if (this.productForm.valid) return;
    const product: Product = {id: this.productId || 0, ...this.productForm.value};
    if (this.editMode && this.productId) {
      this.productSvc.update(this.productId, this.productForm.value).subscribe({
        next: () => {
          alert('Product Updated!');
          this.router.navigate(['/products']);
        },
        error: err => alert(err.error?.message || 'Error updating product'),
      })
    } else {
      this.productSvc.create(product).subscribe({
        next: () => {
          alert('Product Added!');
          this.router.navigate(['/products']);
        },
        error: err => alert(err.error?.message || 'Error adding product'),
      })
    }
  }
}

