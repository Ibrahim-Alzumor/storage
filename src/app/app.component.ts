import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {NavbarComponent} from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  showNavbar = true;

  constructor(private router: Router,) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects || event.url;

        const hideNavbarRoutes = ['/login', '/invoice'];

        const shouldHideNavbar = hideNavbarRoutes.some(route =>
          currentUrl === route || currentUrl.startsWith(route)
        );

        this.showNavbar = !shouldHideNavbar;
      }
    });
  }


  ngOnInit(): void {
  }
}
