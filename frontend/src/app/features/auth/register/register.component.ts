import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService } from '../../../core/services/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatGridListModule,
    AlertComponent,
  ],
  template: `
    <div style="min-height:100vh;background:#f5f5f5;display:flex;align-items:center;justify-content:center;padding:24px;">
      <mat-card style="width:100%;max-width:480px;" appearance="raised">
        <mat-card-header style="justify-content:center;padding:24px 24px 0;">
          <div style="text-align:center;width:100%;">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#3f51b5;">person_add</mat-icon>
            <mat-card-title style="font-size:22px;margin-top:8px;">Create Account</mat-card-title>
            <mat-card-subtitle>Join E-Bookstore — India's favourite online bookstore</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content style="padding:24px;">
          @if (error) {
            <app-alert [message]="error" type="error" />
          }

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="Rahul">
                @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
                  <mat-error>Required.</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Sharma">
                @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
                  <mat-error>Required.</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width" style="margin-bottom:8px;">
              <mat-label>Email Address</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput type="email" formControlName="email" placeholder="rahul@example.com">
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <mat-error>Valid email required.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width" style="margin-bottom:16px;">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="showPwd ? 'text' : 'password'" formControlName="password" placeholder="At least 8 characters">
              <button mat-icon-button matSuffix type="button" (click)="showPwd = !showPwd">
                <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <mat-error>Password must be at least 8 characters.</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit" [disabled]="loading" style="width:100%;height:44px;">
              {{ loading ? 'Creating Account…' : 'Create Account' }}
            </button>
          </form>

          <p style="text-align:center;margin-top:16px;font-size:14px;color:#666;">
            Already have an account?
            <a routerLink="/login" style="color:#3f51b5;font-weight:500;">Sign in</a>
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  showPwd = false;
  loading = false;
  error = '';

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8)]],
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const { email, password, firstName, lastName } = this.form.value;
    this.auth.register(email!, password!, firstName!, lastName!).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => {
        this.error = err.error?.message ?? 'Registration failed.';
        this.loading = false;
      },
    });
  }
}
