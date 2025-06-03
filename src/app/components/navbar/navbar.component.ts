import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Product} from '../../interfaces/product.interface';
import {ProductService} from '../../services/product.service';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    FormsModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  searchTerm: string = '';
  searchResults: Product[] = [];
  clearanceLevel: number | undefined;
  userFirstName: string = '';


  constructor(private authService: AuthService, private router: Router, private userService: UserService, private productService: ProductService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.loadUserInfo();
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

  loadUserInfo(): void {
    const userEmail = this.authService.getUserEmail;
    if (userEmail) {
      this.userService.getByEmail(userEmail).subscribe(
        (user) => {
          if (user && user.firstName) {
            this.userFirstName = user.firstName;
          }
        },
        (error) => {
          console.error('Error fetching users details:', error);
        }
      );
    }
  }


  getClearanceLevel(): number {
    return this.clearanceLevel = this.authService.clearanceLevel;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
