import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthResponse, User } from '../models/models';
import { MOCK_USERS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(this.loadUser());

  login(email: string, password: string): Observable<AuthResponse> {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) {
      return throwError(() => ({ error: { message: 'Invalid email or password.' } })).pipe(delay(400));
    }
    const { password: _pw, ...user } = found;
    const res: AuthResponse = { token: `mock-token-${user.id}`, user };
    this.persist(res);
    return of(res).pipe(delay(400));
  }

  register(email: string, password: string, firstName: string, lastName: string): Observable<AuthResponse> {
    if (MOCK_USERS.find(u => u.email === email)) {
      return throwError(() => ({ error: { message: 'Email already registered.' } })).pipe(delay(400));
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      giftPoints: 0,
    };
    MOCK_USERS.push({ ...newUser, password });
    const res: AuthResponse = { token: `mock-token-${newUser.id}`, user: newUser };
    this.persist(res);
    return of(res).pipe(delay(400));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private persist(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}
