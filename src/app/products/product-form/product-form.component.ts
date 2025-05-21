import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductService} from '../product.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Product} from '../../interfaces/product.interface';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  editMode = false;
  productId: number | null = null;

  constructor(private fb: FormBuilder, private productService: ProductService, private router: Router, private route: ActivatedRoute) {
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
  }

  onSubmit(): void {
    if (!this.productForm.valid) {
      alert('Not valid product form')
    }
    const product: Product = {id: this.productId || 0, ...this.productForm.value};
    if (this.editMode && this.productId) {
      this.productService.update(this.productId, this.productForm.value).subscribe({
        next: () => {
          alert('Product Updated!');
          this.router.navigate(['/']);
        },
        error: err => alert(err.error?.message || 'Error updating product'),
      })
    } else {
      this.productService.create(product).subscribe({
        next: () => {
          alert('Product Added!');
          this.router.navigate(['/']);
        },
        error: err => alert(err.error?.message || 'Error adding product'),
      })
    }
  }
}

