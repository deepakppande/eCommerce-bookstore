import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CheckoutService } from '../../core/services/checkout.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { OrderDetail } from '../../core/models/models';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [
    RouterLink, DatePipe, TitleCasePipe,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatDividerModule, MatDialogModule,
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
        <span style="color:#bdbdbd;display:flex;align-items:center;gap:4px;">
          <mat-icon style="font-size:16px;width:16px;height:16px;">looks_two</mat-icon> Payment
        </span>
        <mat-icon style="color:#bdbdbd;font-size:18px;width:18px;height:18px;">arrow_forward</mat-icon>
        <span style="font-weight:700;color:#3f51b5;display:flex;align-items:center;gap:4px;">
          <mat-icon style="font-size:16px;width:16px;height:16px;">looks_3</mat-icon> Confirmation
        </span>
      </div>

      @if (loading) { <app-spinner /> }

      @if (!loading && order) {

        <!-- Success / status banner -->
        @if (order.status === 'confirmed') {
          <mat-card style="margin-bottom:24px;background:#e8f5e9;border:1px solid #a5d6a7;">
            <mat-card-content style="padding:24px;text-align:center;">
              <div style="width:56px;height:56px;background:#4caf50;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                <mat-icon style="color:white;font-size:32px;width:32px;height:32px;">check_circle</mat-icon>
              </div>
              <h2 style="margin:0 0 4px;color:#1b5e20;font-size:20px;">Order Placed Successfully!</h2>
              <p style="margin:0;color:#2e7d32;font-size:14px;">
                Order #{{ order.id.slice(0,8).toUpperCase() }} has been confirmed.
              </p>
              @if (order.payment) {
                <p style="margin:8px 0 0;font-size:13px;color:#388e3c;">
                  <mat-icon style="font-size:14px;width:14px;height:14px;vertical-align:middle;">receipt</mat-icon>
                  Ref: {{ order.payment.confirmationRef }}
                </p>
              }
            </mat-card-content>
          </mat-card>
        }

        @if (order.status === 'cancelled') {
          <app-alert message="This order has been cancelled." type="warning" />
        }

        <!-- Items ordered -->
        <mat-card appearance="outlined" style="margin-bottom:20px;">
          <mat-card-header>
            <mat-card-title style="font-size:15px;">Items Ordered</mat-card-title>
          </mat-card-header>
          <mat-card-content style="padding:0 16px 16px;">
            <div style="display:flex;flex-direction:column;gap:12px;">
              @for (item of order.items; track item.book.id) {
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:40px;height:52px;background:#e8eaf6;border-radius:4px;flex-shrink:0;overflow:hidden;">
                    @if (item.book.coverImageUrl) {
                      <img [src]="item.book.coverImageUrl" [alt]="item.book.title" style="width:100%;height:100%;object-fit:cover;">
                    } @else {
                      <mat-icon style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#9fa8da;" color="primary">menu_book</mat-icon>
                    }
                  </div>
                  <div style="flex:1;min-width:0;">
                    <p style="margin:0;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ item.book.title }}</p>
                    <p style="margin:0;font-size:12px;color:#888;">Qty: {{ item.quantity }} × ₹{{ item.unitPrice }}</p>
                  </div>
                  <span style="font-weight:600;font-size:14px;">₹{{ item.quantity * item.unitPrice }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Order summary -->
        <mat-card appearance="outlined" style="margin-bottom:20px;">
          <mat-card-header>
            <mat-card-title style="font-size:15px;">Order Summary</mat-card-title>
          </mat-card-header>
          <mat-card-content style="padding:0 16px 16px;">
            <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;">
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#666;">Order placed</span>
                <span>{{ order.placedAt | date:'dd/MM/yyyy, h:mm a' }}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="color:#666;">Status</span>
                <mat-chip [class]="'chip-' + order.status" style="height:24px;font-size:12px;">
                  {{ order.status | titlecase }}
                </mat-chip>
              </div>
              @if (order.payment) {
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:#666;">Payment method</span>
                  <span style="text-transform:uppercase;font-weight:500;">{{ order.payment.method }}</span>
                </div>
              }
              @if (order.giftPointsUsed > 0) {
                <div style="display:flex;justify-content:space-between;color:#388e3c;">
                  <span>Gift points used</span>
                  <span>{{ order.giftPointsUsed }} pts (−₹{{ order.giftPointsUsed }})</span>
                </div>
              }
              <mat-divider></mat-divider>
              <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;">
                <span>Total Paid</span>
                <span>₹{{ order.totalAmount }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Delivery address -->
        @if (order.address) {
          <mat-card appearance="outlined" style="margin-bottom:20px;">
            <mat-card-header>
              <mat-card-title style="font-size:15px;display:flex;align-items:center;gap:6px;">
                <mat-icon color="primary">place</mat-icon> Delivery Address
              </mat-card-title>
            </mat-card-header>
            <mat-card-content style="padding:0 16px 16px;">
              <p style="margin:0;font-size:14px;color:#555;line-height:1.8;">
                {{ order.address.line1 }}<br>
                @if (order.address.line2) { {{ order.address.line2 }}<br> }
                {{ order.address.city }}, {{ order.address.state }} – {{ order.address.postalCode }}<br>
                {{ order.address.country }}
              </p>
            </mat-card-content>
          </mat-card>
        }

        <!-- Cancel order -->
        @if (order.status !== 'cancelled' && canCancel()) {
          <mat-card appearance="outlined" style="margin-bottom:20px;background:#fff3e0;border-color:#ffcc02;">
            <mat-card-content style="padding:16px;">
              <p style="font-size:14px;color:#e65100;margin:0 0 12px;">
                <mat-icon style="vertical-align:middle;font-size:16px;width:16px;height:16px;">schedule</mat-icon>
                You can cancel this order until {{ order.cancelDeadline | date:'dd/MM/yyyy, h:mm a' }}.
              </p>
              <button mat-flat-button color="warn" [disabled]="cancelling" (click)="cancelOrder()">
                <mat-icon>cancel</mat-icon>
                {{ cancelling ? 'Cancelling…' : 'Cancel Order' }}
              </button>
            </mat-card-content>
          </mat-card>
        }

        @if (cancelError) { <app-alert [message]="cancelError" type="error" /> }

        <!-- Actions -->
        <div style="display:flex;flex-wrap:wrap;gap:12px;">
          <a mat-flat-button color="primary" routerLink="/catalogue" style="flex:1;text-align:center;min-width:140px;">
            <mat-icon>library_books</mat-icon> Continue Shopping
          </a>
          <a mat-stroked-button routerLink="/home" style="flex:1;text-align:center;min-width:140px;">
            <mat-icon>receipt_long</mat-icon> View All Orders
          </a>
        </div>
      }
    </div>
  `,
})
export class ConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly checkout = inject(CheckoutService);

  order: OrderDetail | null = null;
  loading = true;
  cancelling = false;
  cancelError = '';

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('orderId')!;
    this.checkout.getOrderDetail(orderId).subscribe({
      next: o => { this.order = o; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  canCancel(): boolean {
    if (!this.order?.cancelDeadline) return false;
    return new Date() < new Date(this.order.cancelDeadline);
  }

  cancelOrder() {
    if (!this.order) return;
    this.cancelling = true;
    this.cancelError = '';
    this.checkout.cancelOrder(this.order.id).subscribe({
      next: updated => { this.order = { ...this.order!, ...updated }; this.cancelling = false; },
      error: err => { this.cancelError = err.error?.message ?? 'Cancellation failed.'; this.cancelling = false; },
    });
  }
}
