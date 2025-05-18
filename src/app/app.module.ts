import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient} from '@angular/common/http';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';

import {routes} from './app.routes';
import {NavbarComponent} from './navbar/navbar.component';
import {LoginComponent} from './auth/login/login.component';
import {ProductListComponent} from './products/product-list/product-list.component';
import {ProductFormComponent} from './products/product-form/product-form.component';
import {UserRegisterComponent} from './users/user-register/user-register.component';
import {TokenInterceptor} from './services/token.interceptor';

import {AuthService} from './services/auth.service';
import {AuthGuard} from './services/auth.guard';
import {ProductService} from './services/product.service';
import {UserService} from './services/user.service';

import {AppComponent} from './app.component';

@NgModule({
    declarations: [],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        routes,
        AppComponent,
        NavbarComponent,
        LoginComponent,
        ProductListComponent,
        ProductFormComponent,
        UserRegisterComponent,
    ],
    providers: [
        AuthService,
        AuthGuard,
        ProductService,
        UserService,
        {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
        provideHttpClient()

    ],
    bootstrap: []
})
export class AppModule {
}
