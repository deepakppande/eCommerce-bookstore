import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { CheckoutService } from '../../../core/services/checkout.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { CHECKOUT_KEY } from '../address/checkout-address.component';

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatRadioModule, MatDividerModule,
    SpinnerComponent, AlertComponent,
  ],
  template: `
    <div class="checkout-container">
      <!-- Progress indicator -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;font-size:13px;">
        <span style="color:#bdbdbd;display:flex;align-items:center;gap:4px;">
          <mat-icon style="font-size:16px;width:16px;height:16px;">looks_one</mat-icon> Address
        </span>
        <mat-icon style="color:#bdbdbd;font-size:18px;width:18px;height:18px;">arrow_forward</mat-icon>
        <span style="font-weight:700;color:#3f51b5;display:flex;align-items:center;gap:4px;">
          <mat-icon style="font-size:16px;width:16px;height:16px;">looks_two</mat-icon> Payment
        </span>
        <mat-icon style="color:#bdbdbd;font-size:18px;width:18px;height:18px;">arrow_forward</mat-icon>
        <span style="color:#bdbdbd;display:flex;align-items:center;gap:4px;">
          <mat-icon style="font-size:16px;width:16px;height:16px;">looks_3</mat-icon> Confirmation
        </span>
      </div>

      <h1 style="font-size:22px;font-weight:600;margin:0 0 20px;">Payment</h1>

      @if (error) { <app-alert [message]="error" type="error" /> }

      <!-- Payment method selection -->
      <mat-card appearance="outlined" style="margin-bottom:20px;">
        <mat-card-header>
          <mat-card-title style="font-size:15px;">Select Payment Method</mat-card-title>
        </mat-card-header>
        <mat-card-content style="padding:8px 16px 16px;">
          <mat-radio-group [(ngModel)]="paymentMethod" style="display:flex;flex-direction:column;gap:12px;">
            @for (method of methods; track method.value) {
              <label style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:8px;border:1px solid;cursor:pointer;"
                     [style.border-color]="paymentMethod === method.value ? '#3f51b5' : '#e0e0e0'"
                     [style.background]="paymentMethod === method.value ? '#e8eaf6' : 'white'">
                <mat-radio-button [value]="method.value"></mat-radio-button>
                <mat-icon [style.color]="method.color">{{ method.icon }}</mat-icon>
                <div>
                  <p style="margin:0;font-weight:600;font-size:14px;">{{ method.label }}</p>
                  <p style="margin:0;font-size:12px;color:#888;">{{ method.hint }}</p>
                </div>
              </label>
            }
          </mat-radio-group>
        </mat-card-content>
      </mat-card>

      <!-- UPI details -->
      @if (paymentMethod === 'upi') {
        <mat-card appearance="outlined" style="margin-bottom:20px;">
          <mat-card-header>
            <mat-card-title style="font-size:15px;">UPI Details</mat-card-title>
          </mat-card-header>
          <mat-card-content style="padding:0 16px 16px;">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>UPI ID</mat-label>
              <mat-icon matPrefix>account_balance_wallet</mat-icon>
              <input matInput [(ngModel)]="upiId" placeholder="rahul&#64;upi or 98765-43210&#64;paytm">
              <mat-hint>e.g. rahul&#64;okicici, 9876543210&#64;ybl</mat-hint>
            </mat-form-field>
          </mat-card-content>
        </mat-card>
      }

      <!-- Card details -->
      @if (paymentMethod === 'card') {
        <mat-card appearance="outlined" style="margin-bottom:20px;">
          <mat-card-header>
            <mat-card-title style="font-size:15px;">Card Details</mat-card-title>
            <mat-card-subtitle>Secured by 256-bit SSL encryption</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content style="padding:0 16px 16px;">
            <form [formGroup]="cardForm" novalidate>
              <mat-form-field appearance="outline" class="full-width" style="margin-bottom:8px;">
                <mat-label>Card Number</mat-label>
                <mat-icon matPrefix>credit_card</mat-icon>
                <input matInput formControlName="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                @if (cardForm.get('cardNumber')?.invalid && cardForm.get('cardNumber')?.touched) {
                  <mat-error>Valid 16-digit card number required.</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width" style="margin-bottom:8px;">
                <mat-label>Cardholder Name</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput formControlName="cardName" placeholder="Rahul Sharma">
              </mat-form-field>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Expiry (MM/YY)</mat-label>
                  <input matInput formControlName="expiry" placeholder="MM/YY" maxlength="5">
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>CVV</mat-label>
                  <input matInput formControlName="cvv" type="password" placeholder="•••" maxlength="4">
                </mat-form-field>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <!-- Net banking -->
      @if (paymentMethod === 'netbanking') {
        <mat-card appearance="outlined" style="margin-bottom:20px;">
          <mat-card-content style="padding:16px;">
            <p style="color:#555;font-size:14px;margin:0;">You will be redirected to your bank's net banking portal to complete the payment securely.</p>
          </mat-card-content>
        </mat-card>
      }

      <!-- Gift points redemption -->
      <mat-card appearance="outlined" style="margin-bottom:20px;">
        <mat-card-content style="padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div>
              <p style="margin:0;font-weight:600;font-size:14px;">
                <mat-icon style="vertical-align:middle;font-size:18px;width:18px;height:18px;color:#ff9800;">card_giftcard</mat-icon>
                Redeem Gift Points
              </p>
              <p style="margin:2px 0 0;font-size:12px;color:#888;">Balance: {{ giftPoints }} pts (₹{{ giftPoints }} value)</p>
            </div>
            <mat-form-field appearance="outline" style="width:100px;margin:0;">
              <mat-label>Points</mat-label>
              <input matInput type="number" [(ngModel)]="pointsToRedeem" [max]="maxRedeemable" min="0">
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Order total -->
      <mat-card appearance="outlined" style="margin-bottom:20px;background:#f9f9f9;">
        <mat-card-content style="padding:16px;">
          <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;">
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#666;">Subtotal</span>
              <span>₹{{ cartService.cart().totalAmount }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#666;">Delivery</span>
              <span style="color:#388e3c;font-weight:600;">FREE</span>
            </div>
            @if (pointsToRedeem > 0) {
              <div style="display:flex;justify-content:space-between;color:#388e3c;">
                <span>Gift Points ({{ pointsToRedeem }} pts)</span>
                <span>−₹{{ pointsToRedeem }}</span>
              </div>
            }
            <mat-divider></mat-divider>
            <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;">
              <span>Total Payable</span>
              <span style="color:#3f51b5;">₹{{ finalTotal }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <button mat-flat-button color="primary" style="width:100%;height:48px;font-size:16px;"
              (click)="pay()" [disabled]="loading">
        @if (loading) { Processing… }
        @else {
          <mat-icon>lock</mat-icon> Pay ₹{{ finalTotal }} Securely
        }
      </button>
    </div>
  `,
})
export class CheckoutPaymentComponent implements OnInit {
  private readonly checkout = inject(CheckoutService);
  readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  paymentMethod = 'upi';
  upiId = '';
  pointsToRedeem = 0;
  loading = false;
  error = '';

  methods = [
    { value: 'upi',        label: 'UPI',               hint: 'PhonePe, GPay, Paytm, BHIM',     icon: 'account_balance_wallet', color: '#9c27b0' },
    { value: 'card',       label: 'Credit / Debit Card', hint: 'Visa, Mastercard, RuPay',       icon: 'credit_card',            color: '#1565c0' },
    { value: 'netbanking', label: 'Net Banking',        hint: 'All major Indian banks',          icon: 'account_balance',        color: '#2e7d32' },
    { value: 'cod',        label: 'Cash on Delivery',   hint: 'Pay when your order arrives',     icon: 'payments',               color: '#e65100' },
  ];

  cardForm = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]],
    cardName:   ['', Validators.required],
    expiry:     ['', Validators.required],
    cvv:        ['', Validators.required],
  });

  get giftPoints()     { return this.auth.currentUser()?.giftPoints ?? 0; }
  get maxRedeemable()  { return Math.min(this.giftPoints, Math.floor(this.cartService.cart().totalAmount)); }
  get finalTotal()     { return Math.max(0, this.cartService.cart().totalAmount - this.pointsToRedeem); }

  ngOnInit() {
    const state = sessionStorage.getItem(CHECKOUT_KEY);
    if (!state) { this.router.navigate(['/checkout/address']); }
  }

  pay() {
    if (this.paymentMethod === 'card' && this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }

    const state = JSON.parse(sessionStorage.getItem(CHECKOUT_KEY) ?? '{}');
    if (!state.addressId) { this.router.navigate(['/checkout/address']); return; }

    this.loading = true;
    this.error = '';

    this.checkout.placeOrder(state.addressId, this.pointsToRedeem).subscribe({
      next: order => {
        const cardToken = this.paymentMethod === 'card' ? 'tok_simulated' : undefined;
        this.checkout.processPayment(order.id, this.paymentMethod, cardToken).subscribe({
          next: () => {
            sessionStorage.removeItem(CHECKOUT_KEY);
            this.router.navigate(['/confirmation', order.id]);
          },
          error: err => {
            this.error = err.error?.message ?? 'Payment failed. Please try again.';
            this.loading = false;
          },
        });
      },
      error: err => {
        this.error = err.error?.message ?? 'Could not place order. Please try again.';
        this.loading = false;
      },
    });
  }
}
