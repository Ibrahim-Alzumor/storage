import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NotificationService} from '../../services/notification.service';
import {Login} from '../../interfaces/login.interface';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup<loginForm>;
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('',
        [
          Validators.required,
          Validators.email,
        ]),
      password: new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ])
    })
  }

  get emailErrorMessage(): string | null {
    const emailControl = this.loginForm.controls.email;
    if (emailControl.touched && emailControl.invalid) {
      if (emailControl.errors?.['required']) {
        return 'Email is required';
      }
      if (emailControl.errors?.['email']) {
        return 'Please enter a valid email';
      }
    }
    return null;
  }

  get passwordErrorMessage(): string | null {
    const passwordControl = this.loginForm.controls.password;
    if (passwordControl.touched && passwordControl.invalid) {
      if (passwordControl.errors?.['required']) {
        return 'Password is required';
      }
    }
    return null;
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.notificationService.showNotification('Please fix the form errors before submitting', 'error');
      return;
    }

    const {email, password} = this.loginForm.value;
    const formValues = {email, password};


    const loginData: Login = {
      email: formValues.email || '',
      password: formValues.password || ''
    };

    if (loginData.email && loginData.password) {
      this.authService.login(loginData).subscribe();
    }
  }

}

interface loginForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}
