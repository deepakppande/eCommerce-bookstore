import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Address, Order, OrderDetail, Payment } from '../models/models';
import {
  MOCK_ADDRESSES,
  MOCK_ORDERS,
  MOCK_ORDER_DETAILS,
} from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  /** In-memory address store; starts from mock seed data */
  private addresses: Address[] = [...MOCK_ADDRESSES];

  /** In-memory order store; starts from mock seed data */
  private orders: Order[] = [...MOCK_ORDERS];
  private orderDetails: Record<string, OrderDetail> = { ...MOCK_ORDER_DETAILS };

  getAddresses(): Observable<Address[]> {
    return of([...this.addresses]).pipe(delay(300));
  }

  addAddress(addr: Omit<Address, 'id'>): Observable<Address> {
    const newAddr: Address = { ...addr, id: `addr-${Date.now()}` };
    this.addresses.push(newAddr);
    return of({ ...newAddr }).pipe(delay(300));
  }

  placeOrder(addressId: string, giftPointsToRedeem = 0): Observable<Order> {
    const address = this.addresses.find(a => a.id === addressId);
    if (!address) {
      return throwError(() => ({ error: { message: 'Address not found.' } }));
    }

    const orderId = `order-${Math.random().toString(36).slice(2, 10)}`;
    const now     = new Date();
    const cancelDeadline = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const order: Order = {
      id: orderId,
      status: 'confirmed',
      totalAmount: 0,          // will be filled in processPayment context
      giftPointsUsed: giftPointsToRedeem,
      placedAt: now.toISOString(),
      cancelDeadline,
    };

    this.orders.unshift(order);
    this.orderDetails[orderId] = {
      ...order,
      items: [],
      address,
    };

    return of({ ...order }).pipe(delay(500));
  }

  processPayment(orderId: string, method: string, _cardToken?: string): Observable<Payment> {
    const detail = this.orderDetails[orderId];
    if (!detail) {
      return throwError(() => ({ error: { message: 'Order not found.' } }));
    }

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      orderId,
      method,
      status: 'completed',
      confirmationRef: `REF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      amount: detail.totalAmount,
      paidAt: new Date().toISOString(),
    };

    detail.payment = payment;

    return of({ ...payment }).pipe(delay(600));
  }

  getOrderDetail(orderId: string): Observable<OrderDetail> {
    const detail = this.orderDetails[orderId];
    if (!detail) {
      return throwError(() => ({ status: 404, error: { message: 'Order not found.' } }));
    }
    return of({ ...detail }).pipe(delay(300));
  }

  getOrders(): Observable<Order[]> {
    return of([...this.orders]).pipe(delay(300));
  }

  cancelOrder(orderId: string): Observable<Order> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      return throwError(() => ({ error: { message: 'Order not found.' } }));
    }
    order.status = 'cancelled';
    if (this.orderDetails[orderId]) {
      this.orderDetails[orderId].status = 'cancelled';
    }
    return of({ ...order }).pipe(delay(400));
  }
}
