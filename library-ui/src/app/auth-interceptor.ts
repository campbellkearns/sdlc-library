import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LIBRARY_API } from './books-api';
import { TokenStore } from './token-store';

// Runs for every request the app makes. Only the Library
// service gets the token: never the sign-in service, never
// anyone else.
export const authInterceptor: HttpInterceptorFn = (
  req,
  next,
) => {
  const token = inject(TokenStore).getToken();

  if (token && req.url.startsWith(LIBRARY_API)) {
    const auth = `Bearer ${token}`;
    return next(
      req.clone({ setHeaders: { Authorization: auth } }),
    );
  }

  return next(req);
};
