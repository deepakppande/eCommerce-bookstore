import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('login stores token and sets currentUser signal', () => {
    const mockResponse = { token: 'abc123', user: { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', giftPoints: 0 } };
    service.login('a@b.com', 'password').subscribe(res => {
      expect(res.token).toBe('abc123');
      expect(service.currentUser()?.email).toBe('a@b.com');
      expect(localStorage.getItem('token')).toBe('abc123');
    });
    const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('logout clears storage and resets signal', () => {
    localStorage.setItem('token', 'tok');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('isLoggedIn returns true when token exists', () => {
    localStorage.setItem('token', 'tok');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('isLoggedIn returns false when no token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });
});
