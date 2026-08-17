import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    AlertComponent,
  ],
  template: `
    <div style="min-height:100vh;background:#f5f5f5;display:flex;align-items:center;justify-content:center;padding:24px;">
      <mat-card style="width:100%;max-width:420px;" appearance="raised">
        <mat-card-header style="justify-content:center;padding:24px 24px 0;">
          <div style="text-align:center;width:100%;">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#3f51b5;">menu_book</mat-icon>
            <mat-card-title style="font-size:22px;margin-top:8px;">Welcome Back</mat-card-title>
            <mat-card-subtitle>Sign in to your E-Bookstore account</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content style="padding:24px;">
          @if (error) {
            <app-alert [message]="error" type="error" />
          }

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <mat-form-field appearance="outline" class="full-width" style="display:block;margin-bottom:16px;">
              <mat-label>Email Address</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput type="email" formControlName="email" placeholder="rahul@example.com" autocomplete="email">
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <mat-error>Please enter a valid email address.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width" style="display:block;margin-bottom:16px;">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="showPwd ? 'text' : 'password'" formControlName="password" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="showPwd = !showPwd">
                <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <mat-error>Password is required.</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit" [disabled]="loading" style="width:100%;height:44px;">
              @if (loading) {
                <mat-spinner diameter="22" style="margin:auto;"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>

          <p style="text-align:center;margin-top:16px;font-size:14px;color:#666;">
            New to E-Bookstore?
            <a routerLink="/register" style="color:#3f51b5;font-weight:500;">Create account</a>
          </p>
          <p style="text-align:center;font-size:12px;color:#999;margin-top:8px;">
            Demo: demo&#64;example.com / password
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  showPwd = false;
  loading = false;
  error = '';

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => {
        this.error = err.error?.message ?? 'Login failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
