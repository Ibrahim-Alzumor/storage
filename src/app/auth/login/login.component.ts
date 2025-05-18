import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],

})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
    });
  }

  get emailErrorMessage(): string | null {
    const emailControl = this.loginForm.controls['email'];
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
    const passwordControl = this.loginForm.controls['password'];
    if (passwordControl.touched && passwordControl.invalid) {
      if (passwordControl.errors?.['required']) {
        return 'Password is required';
      }
    }
    return null;
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    const {email, password} = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => alert(err.error?.message || 'Invalid credentials')
    });
  }
}
