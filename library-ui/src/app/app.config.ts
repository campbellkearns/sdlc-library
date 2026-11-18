import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding(): a route's :id arrives as an input.
    provideRouter(routes, withComponentInputBinding()),
    // Every request goes through the interceptor first.
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};
