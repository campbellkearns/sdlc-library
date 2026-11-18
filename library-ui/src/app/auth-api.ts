import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// The Library's sign-in stub (library-auth-stub). Week 6's
// auth service answers on the same address, the same way.
export const AUTH_API = 'http://localhost:3000/auth/login';

export interface Credentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

@Service()
export class AuthApi {
  private readonly http = inject(HttpClient);

  // A Promise, so the sign-in form's action can await it.
  login(credentials: Credentials): Promise<LoginResponse> {
    return firstValueFrom(
      this.http.post<LoginResponse>(AUTH_API, credentials),
    );
  }
}
