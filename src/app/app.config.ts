import {ApplicationConfig} from '@angular/core';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideRouter, Routes} from '@angular/router';
import {TokenInterceptor} from './interceptors/token.interceptor';
import {ProductListComponent} from './pages/products/product-list/product-list.component';
import {AuthGuard} from './guards/auth.guard';
import {ProductAddComponent} from './pages/products/product-add/product-add.component';
import {LoginComponent} from './pages/login/login.component';
import {UserRegisterComponent} from './pages/users/user-register/user-register.component';
import {BarcodeScannerComponent} from './pages/barcode-scanner/barcode-scanner.component';
import {ChartsComponent} from './pages/charts/charts.component';
import {UserListComponent} from './pages/users/user-list/user-list.component';
import {OrderListComponent} from './pages/orders/order-list/order-list.component';
import {OrderInvoiceComponent} from './pages/orders/order-invoice/order-invoice.component';
import {ClearanceLevelComponent} from './pages/clearance-level/clearance-level.component';
import {
  ADMIN_CLEARANCE_LEVELS,
  ORDER_INVOICE,
  ORDER_VIEW,
  PRODUCT_CREATE,
  PRODUCT_EDIT,
  PRODUCT_SCAN,
  PRODUCT_VIEW,
  REPORT_VIEW,
  USER_CREATE,
  USER_VIEW
} from './constants/function-permissions';
import {DataResolver} from './resolvers/data.resolver';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    resolve: {load: DataResolver},
    children: [
      {
        path: '',
        component: ProductListComponent,
        data: {
          requiredFunctions: PRODUCT_VIEW,
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'add',
        component: ProductAddComponent,
        canActivate: [AuthGuard],
        data: {
          requiredFunctions: PRODUCT_CREATE,
        }
      },
      {
        path: 'add/:id',
        component: ProductAddComponent,
        canActivate: [AuthGuard],
        data: {
          requiredFunctions: PRODUCT_EDIT,
        }
      },
      {
        path: 'register',
        component: UserRegisterComponent,
        canActivate: [AuthGuard],
        data: {
          requiredFunctions: USER_CREATE,
        }
      },
      {
        path: 'users',
        component: UserListComponent,
        canActivate: [AuthGuard],
        data: {
          requiredFunctions: USER_VIEW,
        }
      },
      {
        path: 'barcode',
        component: BarcodeScannerComponent,
        canActivate: [AuthGuard],
        data: {
          requiredFunctions: PRODUCT_SCAN,
        }
      },
      {
        path: 'charts',
        component: ChartsComponent,
        canActivate: [AuthGuard],
        data: {
          requiredFunctions: REPORT_VIEW,
        }
      },
      {
        path: 'orders',
        component: OrderListComponent,
        canActivate: [AuthGuard],
        data: {
          requiredFunctions: ORDER_VIEW,
        }
      },
      {
        path: 'invoice',
        component: OrderInvoiceComponent,
        canActivate: [AuthGuard],
        data: {
          requiredFunctions: ORDER_INVOICE,
        }
      },
      {
        path: 'clearance-levels',
        component: ClearanceLevelComponent,
        canActivate: [AuthGuard],
        data: {
          requiredFunctions: ADMIN_CLEARANCE_LEVELS,
        }
      },
    ]
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([TokenInterceptor])),
    provideRouter(routes),
    // {
    //   provide: APP_INITIALIZER,
    //   // useFactory: (functionInitializer: FunctionInitializerService) => () => {
    //   //   return functionInitializer.initializeFunctions();
    //   // },
    //   deps: [FunctionInitializerService],
    //   multi: true
    // }
  ]
};
