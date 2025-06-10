import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Product} from '../../interfaces/product.interface';
import {ProductService} from '../../services/product.service';
import {UserService} from '../../services/user.service';
import {HasPermissionDirective} from '../../directives/has-permission.directive';
import {
  ADMIN_CLEARANCE_LEVELS,
  ORDER_VIEW,
  PRODUCT_CREATE,
  REPORT_VIEW,
  USER_CREATE,
  USER_VIEW
} from '../../constants/function-permissions';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, FormsModule, HasPermissionDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  searchTerm = '';
  searchResults: Product[] = [];
  clearanceLevel: number | undefined;
  userFirstName = '';
  protected readonly PRODUCT_CREATE = PRODUCT_CREATE;
  protected readonly USER_CREATE = USER_CREATE;
  protected readonly REPORT_VIEW = REPORT_VIEW;
  protected readonly USER_VIEW = USER_VIEW;
  protected readonly ORDER_VIEW = ORDER_VIEW;
  protected readonly ADMIN_CLEARANCE_LEVELS = ADMIN_CLEARANCE_LEVELS;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private productService: ProductService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.clearanceLevel = this.authService.clearanceLevel;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      this.router.navigate([], {
        queryParams: {name: null, page: null, limit: null},
        queryParamsHandling: 'merge',
        replaceUrl: true,
        relativeTo: this.route
      });
      return;
    }
    this.productService.getByName(this.searchTerm, 1, 50).subscribe(results => {
      this.searchResults = results.items;
      this.router.navigate([], {
        queryParams: {name: this.searchTerm, page: 1, limit: 50},
        queryParamsHandling: 'merge',
        replaceUrl: true,
        relativeTo: this.route
      });
    });
  }


  loadUserInfo(): any {
    const userEmail = this.authService.getUserEmail;
    if (userEmail) {
      this.userService.getByEmail(userEmail).subscribe({
        next: user => {
          if (user) {
            this.userFirstName = user.firstName;
          }
        },
        error: error => {
          console.error('Error fetching users details:', error);
        }
      });
    }
  }
}
