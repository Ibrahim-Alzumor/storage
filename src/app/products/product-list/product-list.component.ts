import {Component, OnInit} from '@angular/core';
import {Product} from '../../interfaces/product.interface';
import {ProductService} from '../../services/product.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  selectedProduct: Product | null = null;


  constructor(private productSvc: ProductService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      if (name) {
        this.productSvc.getByName(name).subscribe(products => this.products = products);
      } else {
        this.productSvc.getAll().subscribe(products => this.products = products);
      }
    })
  }

  goToEdit(product: Product) {
    this.router.navigate(['/product-form', product.id]);
  }

  openProductModal(Product: Product): void {
    this.selectedProduct = Product;
  }

  closeModal(): void {
    this.selectedProduct = null;
  }
}
