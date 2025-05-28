import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../services/user.service';
import {NgClass, NgIf} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NotificationService} from '../../services/notification.service';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css'],
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgIf,
  ]
})
export class UserRegisterComponent implements OnInit {
  registerForm: FormGroup;
  possibleClearanceLevels: { value: number; label: string }[] = [];
  clearanceLevel: number | undefined;


  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z\s]+$/),]],
      lastName: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z\s]+$/),]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      jobTitle: [''],
      phone: ['', [Validators.minLength(10), Validators.pattern(/^\+?[1-9]\d{1,14}$/),]],
      clearanceLevel: [0, Validators.required]
    });
    this.setPossibleClearanceLevels();
  }


  get firstNameErrorMessage(): string | null {
    const firstNameControl = this.registerForm.controls['email'];
    if (firstNameControl.touched && firstNameControl.invalid) {
      if (firstNameControl.errors?.['required']) {
        return 'First Name is required';
      }
      if (firstNameControl.errors?.['maxLength']) {
        return 'First Name is Maximum 30 characters';
      }
      if (firstNameControl.errors?.['pattern']) {
        return 'First Name must only contain letters';
      }
    }
    return null;
  }

  get lastNameErrorMessage(): string | null {
    const lastNameControl = this.registerForm.controls['lastName'];
    if (lastNameControl.touched && lastNameControl.invalid) {
      if (lastNameControl.errors?.['required']) {
        return 'First Name is required';
      }
      if (lastNameControl.errors?.['maxLength']) {
        return 'First Name is Maximum 30 characters';
      }
      if (lastNameControl.errors?.['pattern']) {
        return 'Last Name must only contain letters';
      }
    }
    return null;
  }

  get emailErrorMessage(): string | null {
    const emailControl = this.registerForm.controls['email'];
    if (emailControl.touched && emailControl.invalid) {
      if (emailControl.errors?.['required']) {
        return 'Email is required';
      }
      if (emailControl.errors?.['email']) {
        return 'Please enter a valid email';
      }
      if (emailControl.errors?.['pattern']) {
        return 'Invalid email format. Please use a valid format like example@domain.com';
      }
    }
    return null;
  }

  get passwordErrorMessage(): string | null {
    const passwordControl = this.registerForm.controls['password'];
    if (passwordControl.touched && passwordControl.invalid) {
      if (passwordControl.errors?.['required']) {
        return 'Password is required';
      }
      if (passwordControl.errors?.['minlength']) {
        return 'Password must be at least 8 characters';
      }
      if (passwordControl.errors?.['pattern']) {
        return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.';
      }
    }
    return null;
  }

  get phoneErrorMessage(): string | null {
    const phoneControl = this.registerForm.controls['phone'];
    if (phoneControl.touched && phoneControl.invalid) {
      if (phoneControl.errors?.['minlength']) {
        return 'Phone Number must be at least 10 digits';
      }
      if (phoneControl.errors?.['pattern']) {
        return 'Invalid phone number format. Please use a valid format like +123-45-678-9000 or 123-456-7890';
      }
    }
    return null;
  }

  ngOnInit() {
    this.authService.isLoggedIn();
  }

  setPossibleClearanceLevels() {
    const myLevel: number = this.authService.clearanceLevel;
    if (myLevel === 3 || myLevel === 4) {
      this.possibleClearanceLevels = [
        {value: 0, label: 'Worker'},
        {value: 1, label: 'Associate'},
        {value: 2, label: 'Manager'},
        {value: 3, label: 'Owner'},
      ];
    } else if (myLevel === 2) {
      this.possibleClearanceLevels = [
        {value: 0, label: 'Worker'},
        {value: 1, label: 'Associate'},
        {value: 2, label: 'Manager'},
      ];
    } else {
      this.possibleClearanceLevels = [];
    }
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    if (this.authService.clearanceLevel < 2) {
      this.notificationService.showNotification('You do not have clearance to register users.', 'error');
      return;
    }
    this.userService.register(this.registerForm.value).subscribe({
      next: () => this.notificationService.showNotification('User registered!', 'success'),
      error: err => this.notificationService.showNotification(err.error?.message || 'Error registering user', 'error')
    });
  }

  getClearanceLevel(): number {
    return this.clearanceLevel = this.authService.clearanceLevel;
  }
}
