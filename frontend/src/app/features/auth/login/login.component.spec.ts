import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn', 'currentUser']);
    authSpy.currentUser.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('shows validation errors on submit with empty form', () => {
    component.submit();
    expect(component.form.touched).toBeTrue();
  });

  it('calls auth.login with form values on valid submit', () => {
    authSpy.login.and.returnValue(of({ token: 'tok', user: { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', giftPoints: 0 } }));
    component.form.setValue({ email: 'a@b.com', password: 'password123' });
    component.submit();
    expect(authSpy.login).toHaveBeenCalledWith('a@b.com', 'password123');
  });

  it('sets error message on failed login', () => {
    authSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));
    component.form.setValue({ email: 'a@b.com', password: 'wrongpass' });
    component.submit();
    expect(component.error).toBe('Invalid credentials');
  });
});
