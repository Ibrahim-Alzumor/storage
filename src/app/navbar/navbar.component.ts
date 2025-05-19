import {Component} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {Product} from '../interfaces/product.interface';
import {ProductService} from '../services/product.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    FormsModule,
    NgIf
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  searchTerm: string = '';
  searchResults: Product[] = [];

  constructor(protected auth: AuthService, private router: Router, private productSvc: ProductService) {
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      return;
    }
    this.productSvc.getByName(this.searchTerm).subscribe(results => {
      this.searchResults = results;
    });
  }

  goToEdit(productId: number): void {
    this.router.navigate(['/edit', productId]);
  }


}
