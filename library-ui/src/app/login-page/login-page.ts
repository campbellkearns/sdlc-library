import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  form,
  FormField,
  FormRoot,
  required,
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthApi, Credentials } from '../auth-api';
import { TokenStore } from '../token-store';

@Component({
  selector: 'app-login-page',
  imports: [FormField, FormRoot],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly authApi = inject(AuthApi);
  private readonly tokenStore = inject(TokenStore);
  private readonly router = inject(Router);

  protected readonly loginModel = signal<Credentials>({
    username: '',
    password: '',
  });

  protected readonly loginForm = form(
    this.loginModel,
    (login) => {
      required(login.username, {
        message: 'Username is required.',
      });
      required(login.password, {
        message: 'Password is required.',
      });
    },
    {
      submission: {
        action: async (field) => {
          try {
            const credentials = field().value();
            const reply = await this.authApi.login(credentials);
            this.tokenStore.setToken(reply.accessToken);
            this.router.navigate(['/books']);
            return;
          } catch (error) {
            // 401: wrong name or password. Else: no answer.
            const wrong =
              error instanceof HttpErrorResponse &&
              error.status === 401;
            return {
              kind: 'signInFailed',
              message: wrong
                ? 'Invalid username or password.'
                : 'Could not reach the sign-in service.',
            };
          }
        },
      },
    },
  );
}
