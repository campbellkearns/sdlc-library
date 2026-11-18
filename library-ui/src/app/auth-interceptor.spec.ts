import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AUTH_API } from './auth-api';
import { authInterceptor } from './auth-interceptor';
import { LIBRARY_API } from './books-api';
import { makeToken } from './testing/make-token';
import { TokenStore } from './token-store';

const ROSA = makeToken({ sub: 'rosa', roles: ['LIBRARIAN'] });

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.inject(TokenStore).setToken(ROSA);
  });

  // The instructor writes this one in class.
  it('adds the token to Library requests (S4)', () => {
    http.get(LIBRARY_API).subscribe();

    const request = httpTesting.expectOne(LIBRARY_API);
    const headers = request.request.headers;
    expect(headers.get('Authorization')).toBe(`Bearer ${ROSA}`);
  });

  // The students write this one in the lab.
  it('keeps the token from the sign-in service (S4)', () => {
    http.post(AUTH_API, {}).subscribe();

    const request = httpTesting.expectOne(AUTH_API);
    const headers = request.request.headers;
    expect(headers.has('Authorization')).toBe(false);
  });
});
