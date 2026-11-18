import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
} from '@angular/router';

import { librarianGuard } from './librarian-guard';
import { makeToken } from './testing/make-token';
import { TokenStore } from './token-store';

describe('librarianGuard', () => {
  // Generated: runs the guard where inject() works, as the
  // router would.
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      librarianGuard(...guardParameters),
    );

  // The guard ignores the route, so empty stand-ins will do.
  const runGuard = () =>
    executeGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('sends a signed-out visitor to sign in (S1)', () => {
    expect(String(runGuard())).toBe('/login');
  });

  it('lets a librarian in (BR-08)', () => {
    TestBed.inject(TokenStore).setToken(
      makeToken({ sub: 'rosa', roles: ['LIBRARIAN'] }),
    );

    expect(runGuard()).toBe(true);
  });

  it('sends a reader back to the catalogue (S5)', () => {
    TestBed.inject(TokenStore).setToken(
      makeToken({ sub: 'sam', roles: ['READER'] }),
    );

    expect(String(runGuard())).toBe('/books');
  });
});
