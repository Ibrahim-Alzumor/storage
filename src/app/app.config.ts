import {ApplicationConfig} from '@angular/core';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideRouter, Routes} from '@angular/router';
import {TokenInterceptor} from './interceptors/token.interceptor';
import {ProductListComponent} from './pages/products/product-list/product-list.component';
import {AuthGuard} from './auth/auth.guard';
import {ProductAddComponent} from './pages/products/product-add/product-add.component';
import {LoginComponent} from './pages/login/login.component';
import {UserRegisterComponent} from './pages/users/user-register/user-register.component';
import {BarcodeScannerComponent} from './pages/barcode-scanner/barcode-scanner.component';
import {ChartsComponent} from './pages/charts/charts.component';
import {UserListComponent} from './pages/users/user-list/user-list.component';
import {OrderListComponent} from './pages/orders/order-list/order-list.component';

const routes: Routes = [
  {path: '', component: ProductListComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 0}},
  {path: 'add', component: ProductAddComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 2}},
  {path: 'add/:id', component: ProductAddComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 2}},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: UserRegisterComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 2}},
  {path: 'users', component: UserListComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 2}},
  {path: 'barcode', component: BarcodeScannerComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 2}},
  {path: 'charts', component: ChartsComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 2}},
  {path: 'orders', component: OrderListComponent, canActivate: [AuthGuard], data: {minimumRequiredLevel: 2}},
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([TokenInterceptor])),
    provideRouter(routes),

  ]
};


