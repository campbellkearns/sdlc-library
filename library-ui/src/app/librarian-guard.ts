import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStore } from './token-store';

// BR-08: only librarians reach Add a book.
export const librarianGuard: CanActivateFn = () => {
  const tokenStore = inject(TokenStore);
  const router = inject(Router);

  if (tokenStore.isLibrarian()) {
    return true;
  }

  // Returning a URL sends the visitor there instead.
  // Signed out: sign in. Signed in as a reader: the catalogue.
  return router.parseUrl(
    tokenStore.isAuthenticated() ? '/books' : '/login',
  );
};
