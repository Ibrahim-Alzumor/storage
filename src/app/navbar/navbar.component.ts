import {Component} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Product} from '../products/product.interface';
import {ProductService} from '../products/product.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    FormsModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  searchTerm: string = '';
  searchResults: Product[] = [];
  clearanceLevel: number | undefined;

  constructor(private authService: AuthService, private router: Router, private productService: ProductService, private route: ActivatedRoute) {
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.searchResults = [];

      this.router.navigate([], {
        queryParams: {name: null},
        queryParamsHandling: 'merge',
        replaceUrl: true,
        relativeTo: this.route
      });
      return;
    }
    this.productService.getByName(this.searchTerm).subscribe(results => {
      this.searchResults = results;
      this.router.navigate([], {
        queryParams: {name: this.searchTerm},
        queryParamsHandling: 'merge',
        replaceUrl: true,
        relativeTo: this.route
      });
    });
  }

  goToEdit(productId: number): void {
    this.router.navigate(['/edit', productId]);
    this.searchResults = [];
    this.searchTerm = '';
  }

  getClearanceLevel(): number {
    return this.clearanceLevel = this.authService.clearanceLevel;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
