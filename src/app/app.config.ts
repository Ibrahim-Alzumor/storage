import {ApplicationConfig} from '@angular/core';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideRouter, Routes} from '@angular/router';
import {TokenInterceptor} from './interceptors/token.interceptor';
import {ProductListComponent} from './products/product-list/product-list.component';
import {AuthGuard} from './auth/auth.guard';
import {ProductFormComponent} from './products/product-form/product-form.component';
import {LoginComponent} from './users/login/login.component';
import {UserRegisterComponent} from './users/user-register/user-register.component';

const routes: Routes = [
  {path: '', component: ProductListComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 0}},
  {path: 'add', component: ProductFormComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 2}},
  {path: 'add/:id', component: ProductFormComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 2}},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: UserRegisterComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 2}},
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([TokenInterceptor])),
    provideRouter(routes),

  ]
};


