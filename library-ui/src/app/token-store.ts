import { Service, signal, computed } from '@angular/core';

// In memory only, on purpose: no localStorage, no cookie.
// Reloading the page signs you out.
@Service()
export class TokenStore {
  private readonly token = signal<string | null>(null);
  private readonly username = signal<string | null>(null);
  private readonly roles = signal<string[]>([]);

  readonly isAuthenticated = computed(
    () => this.token() !== null,
  );

  // BR-08: only librarians change the catalogue.
  readonly isLibrarian = computed(() =>
    this.roles().includes('LIBRARIAN'),
  );

  readonly currentUsername = this.username.asReadonly();
  readonly currentRoles = this.roles.asReadonly();

  // rosa's token carries { sub: 'rosa', roles: ['LIBRARIAN'] }.
  // The browser reads them only to decide what to SHOW.
  setToken(token: string): void {
    const claims = readClaims(token);
    this.token.set(token);
    this.username.set(claims.sub);
    this.roles.set(claims.roles);
  }

  getToken(): string | null {
    return this.token();
  }

  clear(): void {
    this.token.set(null);
    this.username.set(null);
    this.roles.set([]);
  }
}

interface Claims {
  sub: string;
  roles: string[];
}

// A JWT is three base64url parts: header.payload.signature.
// The middle part is JSON. Reading it needs no secret: a JWT
// is signed, not encrypted.
function readClaims(token: string): Claims {
  const payload = token.split('.')[1];
  // base64url uses - and _ where atob() expects + and /.
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}
