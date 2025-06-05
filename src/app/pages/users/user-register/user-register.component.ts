import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {UserService} from '../../../services/user.service';
import {NotificationService} from '../../../services/notification.service';
import {ClearanceLevelService} from '../../../services/clearance-level.service';
import {User} from '../../../interfaces/user.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {HasPermissionDirective} from '../../../directives/has-permission.directive';
import {USER_DISABLE} from '../../../constants/function-permissions';
import {ClearanceLevel} from '../../../interfaces/clearance-level.interface';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-users-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css'],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    HasPermissionDirective
  ]
})
export class UserRegisterComponent implements OnInit {
  registerForm: FormGroup;
  possibleClearanceLevels: ClearanceLevel[] = [];
  // possibleClearanceLevels: { value: number; label: string }[] = [];
  clearanceLevel: number | undefined;
  editMode = false;
  userEmail: string | null = null;
  user: User | null = null;
  hidePassword = true;
  protected readonly USER_DISABLE = USER_DISABLE;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private clearanceLevelService: ClearanceLevelService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z\s]+$/),]],
      lastName: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z\s]+$/),]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      jobTitle: [''],
      phone: ['', [Validators.minLength(10), Validators.pattern(/^\+?[1-9]\d{1,14}$/),]],
      clearanceLevel: [0, Validators.required],
      active: [true]
    });
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
    this.possibleClearanceLevels = this.clearanceLevelService.getClearanceLevelsValue();
    this.possibleClearanceLevels.sort((a, b) => a.level - b.level);
    this.authService.isLoggedIn();
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      if (email) {
        this.editMode = true;
        this.userEmail = email;
        this.loadUserData();
      }
    });
  }

  loadUserData(): void {
    if (this.userEmail) {
      this.userService.getByEmail(this.userEmail).subscribe({
        next: (user) => {
          this.user = user;
          this.registerForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            jobTitle: user.jobTitle || '',
            phone: user.phone || '',
            clearanceLevel: user.clearanceLevel,
            active: user.active !== false
          });

          this.registerForm.get('password')?.clearValidators();
          this.registerForm.get('password')?.updateValueAndValidity();

          this.registerForm.get('email')?.disable();
        },
        error: () => {
          this.notificationService.showNotification('Error loading user data', 'error');
          this.router.navigate(['/users']);
        }
      });
    }
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      return;
    }

    if (this.editMode && this.userEmail) {
      this.registerForm.get('email')?.enable();

      const userData: Partial<User> = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        jobTitle: this.registerForm.value.jobTitle,
        phone: this.registerForm.value.phone,
        clearanceLevel: this.registerForm.value.clearanceLevel,
        active: this.registerForm.value.active
      };

      if (this.registerForm.value.password) {
        userData.password = this.registerForm.value.password;
      }

      this.userService.updateUser(this.userEmail, userData).subscribe({
        next: () => {
          this.notificationService.showNotification('User updated successfully', 'success');
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.notificationService.showNotification(error.error?.message || 'Error updating user', 'error');
        }
      });
    } else {
      this.userService.register(this.registerForm.value).subscribe({
        next: () => {
          this.notificationService.showNotification('User registered successfully!', 'success');
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.notificationService.showNotification(error.error?.message || 'Registration failed', 'error');
        }
      });
    }
  }

  toggleActive(): void {
    if (!this.editMode || !this.userEmail) return;

    const newStatus = !this.registerForm.value.active;
    this.registerForm.patchValue({active: newStatus});

    if (!newStatus) {
      this.userService.disableUser(this.userEmail).subscribe({
        next: () => {
          this.notificationService.showNotification('User disabled successfully', 'success');
        },
        error: (error) => {
          this.notificationService.showNotification(error.error?.message || 'Error disabling user', 'error');
          this.registerForm.patchValue({active: true});
        }
      });
    } else {
      this.notificationService.showNotification('Status changed to active. Save changes to apply.', 'info');
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
