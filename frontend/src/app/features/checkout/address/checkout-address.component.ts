import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { CheckoutService } from '../../../core/services/checkout.service';
import { CartService } from '../../../core/services/cart.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { Address } from '../../../core/models/models';

export const CHECKOUT_KEY = 'checkout_state';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

@Component({
  selector: 'app-checkout-address',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatRadioModule, MatDividerModule, MatStepperModule,
    SpinnerComponent, AlertComponent,
  ],
  template: `
    <div class="checkout-container">
      <!-- Progress indicator -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;font-size:13px;">
        <span style="font-weight:700;color:#3f51b5;display:flex;align-items:center;gap:4px;">
          <mat-icon style="font-size:16px;width:16px;height:16px;">looks_one</mat-icon> Address
        </span>
        <mat-icon style="color:#bdbdbd;font-size:18px;width:18px;height:18px;">arrow_forward</mat-icon>
        <span style="color:#bdbdbd;display:flex;align-items:center;gap:4px;">
          <mat-icon style="font-size:16px;width:16px;height:16px;">looks_two</mat-icon> Payment
        </span>
        <mat-icon style="color:#bdbdbd;font-size:18px;width:18px;height:18px;">arrow_forward</mat-icon>
        <span style="color:#bdbdbd;display:flex;align-items:center;gap:4px;">
          <mat-icon style="font-size:16px;width:16px;height:16px;">looks_3</mat-icon> Confirmation
        </span>
      </div>

      <h1 style="font-size:22px;font-weight:600;margin:0 0 20px;">Delivery Address</h1>

      @if (error) { <app-alert [message]="error" type="error" /> }
      @if (loading) { <app-spinner /> }

      <!-- Saved addresses -->
      @if (!loading && addresses.length > 0) {
        <mat-card appearance="outlined" style="margin-bottom:20px;">
          <mat-card-header>
            <mat-card-title style="font-size:15px;">Saved Addresses</mat-card-title>
          </mat-card-header>
          <mat-card-content style="padding:8px 16px 16px;">
            <mat-radio-group [(ngModel)]="selectedAddressId" style="display:flex;flex-direction:column;gap:12px;">
              @for (addr of addresses; track addr.id) {
                <mat-radio-button [value]="addr.id">
                  <div style="margin-left:4px;">
                    <p style="margin:0;font-weight:600;font-size:14px;">{{ addr.label }}</p>
                    <p style="margin:0;font-size:13px;color:#555;">
                      {{ addr.line1 }}{{ addr.line2 ? ', ' + addr.line2 : '' }},
                      {{ addr.city }}, {{ addr.state }} – {{ addr.postalCode }}, {{ addr.country }}
                    </p>
                  </div>
                </mat-radio-button>
              }
            </mat-radio-group>
          </mat-card-content>
        </mat-card>
      }

      <!-- Add new address -->
      <mat-card appearance="outlined" style="margin-bottom:20px;">
        <mat-card-header style="cursor:pointer;" (click)="showForm = !showForm">
          <mat-card-title style="font-size:15px;display:flex;align-items:center;gap:8px;">
            <mat-icon color="primary">add_location_alt</mat-icon>
            Add a New Address
            <mat-icon style="margin-left:auto;">{{ showForm ? 'expand_less' : 'expand_more' }}</mat-icon>
          </mat-card-title>
        </mat-card-header>
        @if (showForm) {
          <mat-card-content style="padding:0 16px 16px;">
            <form [formGroup]="addrForm" (ngSubmit)="saveAddress()" novalidate>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Label (e.g. Home)</mat-label>
                  <input matInput formControlName="label" placeholder="Home">
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>PIN Code</mat-label>
                  <input matInput formControlName="postalCode" placeholder="400001" maxlength="6">
                  @if (addrForm.get('postalCode')?.invalid && addrForm.get('postalCode')?.touched) {
                    <mat-error>6-digit PIN code required.</mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width" style="margin-bottom:4px;">
                <mat-label>Address Line 1</mat-label>
                <input matInput formControlName="line1" placeholder="House/Flat No., Building, Street">
                @if (addrForm.get('line1')?.invalid && addrForm.get('line1')?.touched) {
                  <mat-error>Address line 1 is required.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width" style="margin-bottom:4px;">
                <mat-label>Address Line 2 (optional)</mat-label>
                <input matInput formControlName="line2" placeholder="Area, Landmark">
              </mat-form-field>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>City / District</mat-label>
                  <input matInput formControlName="city" placeholder="Mumbai">
                  @if (addrForm.get('city')?.invalid && addrForm.get('city')?.touched) {
                    <mat-error>Required.</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>State</mat-label>
                  <mat-select formControlName="state">
                    @for (s of indianStates; track s) {
                      <mat-option [value]="s">{{ s }}</mat-option>
                    }
                  </mat-select>
                  @if (addrForm.get('state')?.invalid && addrForm.get('state')?.touched) {
                    <mat-error>Required.</mat-error>
                  }
                </mat-form-field>
              </div>

              <button mat-flat-button color="primary" type="submit" [disabled]="savingAddress">
                <mat-icon>save</mat-icon>
                {{ savingAddress ? 'Saving…' : 'Save Address' }}
              </button>
            </form>
          </mat-card-content>
        }
      </mat-card>

      <!-- Cart summary -->
      <mat-card appearance="outlined" style="margin-bottom:20px;background:#f9f9f9;">
        <mat-card-content style="padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:14px;color:#555;">
              <mat-icon style="vertical-align:middle;font-size:16px;width:16px;height:16px;">shopping_cart</mat-icon>
              {{ cartService.cart().totalItems }} item(s) in cart
            </div>
            <span style="font-weight:700;font-size:18px;">₹{{ cartService.cart().totalAmount }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <button mat-flat-button color="primary" style="width:100%;height:48px;font-size:16px;"
              (click)="continueToPayment()" [disabled]="!selectedAddressId">
        <mat-icon>arrow_forward</mat-icon> Continue to Payment
      </button>
    </div>
  `,
})
export class CheckoutAddressComponent implements OnInit {
  private readonly checkout = inject(CheckoutService);
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly indianStates = INDIAN_STATES;
  addresses: Address[] = [];
  selectedAddressId = '';
  loading = true;
  savingAddress = false;
  showForm = false;
  error = '';

  addrForm = this.fb.group({
    label:      ['Home'],
    line1:      ['', Validators.required],
    line2:      [''],
    city:       ['', Validators.required],
    state:      ['Maharashtra', Validators.required],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    country:    ['India'],
  });

  ngOnInit() {
    this.checkout.getAddresses().subscribe({
      next: addrs => {
        this.addresses = addrs;
        this.selectedAddressId = addrs.find(a => a.isDefault)?.id ?? addrs[0]?.id ?? '';
        this.loading = false;
        this.showForm = addrs.length === 0;
      },
      error: () => { this.loading = false; this.showForm = true; },
    });
  }

  saveAddress() {
    if (this.addrForm.invalid) { this.addrForm.markAllAsTouched(); return; }
    this.savingAddress = true;
    const val = this.addrForm.value;
    this.checkout.addAddress({
      label: val.label ?? 'Home',
      line1: val.line1!, line2: val.line2 ?? undefined,
      city: val.city!, state: val.state!, postalCode: val.postalCode!, country: val.country ?? 'India',
      isDefault: this.addresses.length === 0,
    }).subscribe({
      next: addr => {
        this.addresses.push(addr);
        this.selectedAddressId = addr.id;
        this.savingAddress = false;
        this.showForm = false;
      },
      error: () => { this.savingAddress = false; },
    });
  }

  continueToPayment() {
    if (!this.selectedAddressId) return;
    sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify({ addressId: this.selectedAddressId }));
    this.router.navigate(['/checkout/payment']);
  }
}
