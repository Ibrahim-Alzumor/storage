import {Component} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  searchTerm = "";

  constructor(private authSvc: AuthService, private router: Router) {
  }

  logout(): void {
    this.authSvc.logout();
    this.router.navigate(['/login']);
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.router.navigate(['/products'], {queryParams: {name: this.searchTerm}});
    }
  }


}
