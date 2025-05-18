import {Routes} from '@angular/router';
import {ProductListComponent} from './products/product-list/product-list.component';
import {AuthGuard} from './services/auth.guard';
import {ProductFormComponent} from './products/product-form/product-form.component';
import {LoginComponent} from './auth/login/login.component';
import {UserRegisterComponent} from './users/user-register/user-register.component';

export const routes: Routes = [
  {path: '', component: ProductListComponent, canActivate: [AuthGuard]},
  {path: 'add', component: ProductFormComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent,},
  {path: 'register', component: UserRegisterComponent, canActivate: [AuthGuard]},
];
