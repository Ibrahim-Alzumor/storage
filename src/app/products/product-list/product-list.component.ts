import {Component, OnInit} from '@angular/core';
import {Product} from '../../interfaces/product.interface';
import {ProductService} from '../../services/product.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [
    NgIf,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  selectedProduct: Product | null = null;


  constructor(protected productSvc: ProductService, private router: Router, private route: ActivatedRoute) {
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
    this.router.navigate(['/add', product.id]);
  }

  openProductModal(Product: Product): void {
    this.selectedProduct = Product;
  }

  closeModal(): void {
    this.selectedProduct = null;
  }

  hasImage(): boolean {
    return Object.values(this.products).flat().some(p => p.image);
  }

}
