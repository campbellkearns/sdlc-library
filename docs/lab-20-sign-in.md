# Lab 20: Signing in to the Library

In class we built sign-in: a token store, a sign-in page at `/login`, and an interceptor that sends the token to the Library service. But nothing on screen says who is signed in, and anyone can still open Add a book. You finish the story.

Work **test first**, as before: red, green, refactor.

## Where to start

- **You followed the demo:** carry on in your own repo.
- **You fell behind in the demo:** the files are in "Catch up to the end of the demo" at the bottom.
- **You never finished Lab 19:** commit or stash your work, then `git fetch` and `git checkout lab-19-done`, and catch up to the end of the demo from there.

**Four terminals** now: the three from before (`mvn spring-boot:run`, `npx ng serve`, `npx ng test`) and the sign-in stub:

```bash
cd library-auth-stub
npm install
node server.js
```

It listens on port 3000 and knows two users:

| User | Password | Role |
|---|---|---|
| `rosa` | `librarian123` | LIBRARIAN |
| `sam` | `reader123` | READER |

## The story

From BR-08: *only librarians should be able to change the catalogue; readers can only look.*

> **LIB-4.** As the **head librarian**, I want **only librarians to add books**, so that **readers can look but not change the catalogue**.

### Acceptance criteria

- **S1.** Signed out, when I open Add a book, I am taken to Sign in.
- **S2.** After I sign in, the header says "Signed in as rosa (LIBRARIAN)". *(signing in was done in class; the header is yours)*
- **S3.** A wrong password says "Invalid username or password.". No answer from the sign-in service says "Could not reach the sign-in service.". *(done in class)*
- **S4.** My token goes with every request to the Library service, and to nobody else. *(done in class; you prove "nobody else")*
- **S5.** Signed in as a reader, I see no Add a book link, and the app will not open Add a book for me: it shows the catalogue instead.
- **S6.** Sign out forgets me. So does reloading the page.

**Not in this story:** the Library service itself still takes a book from anyone. You will see that at the end of the lab. Thursday's work fixes it.

---

## L1. Who is a librarian? (BR-08)

1. **Tests first**, in `token-store.spec.ts`. Use the `makeToken()` helper from class to build each user's token:
   - it knows rosa is a librarian;
   - it knows sam is not a librarian;
   - `clear()` signs out (S6): after it, `isAuthenticated()` and `isLibrarian()` are both false.
2. **Green:** add an `isLibrarian` computed signal to `TokenStore`.

<details>
<summary>Hint: one test and the signal</summary>

```ts
const SAM = makeToken({ sub: 'sam', roles: ['READER'] });

it('knows sam is not a librarian (BR-08)', () => {
  store.setToken(SAM);

  expect(store.isLibrarian()).toBe(false);
});
```

```ts
// in token-store.ts, next to isAuthenticated
readonly isLibrarian = computed(() =>
  this.roles().includes('LIBRARIAN'),
);
```

</details>

## L2. A guard on Add a book (S1, S5)

A **guard** is a function the router runs before it opens a route. It answers `true` (go ahead) or a URL (go there instead).

1. Generate it: `npx ng g guard librarian --implements CanActivate`. You get `librarian-guard.ts` and a spec whose `executeGuard` runs the guard the way the router would.
2. **Tests first**, in `librarian-guard.spec.ts`:
   - signed out, it sends you to `/login` (S1);
   - signed in as rosa, it answers `true`;
   - signed in as sam, it sends you to `/books` (S5).

   A URL comes back as a `UrlTree`. `String(result)` turns it into `'/login'`, which is easy to check.
3. **Green:** write the guard. `inject(Router).parseUrl('/login')` makes the `UrlTree`.
4. Put it on the route: `canActivate: [librarianGuard]` on `books/new` in `app.routes.ts`.
5. **Browser:** signed out, type `localhost:4200/books/new` in the address bar: you land on Sign in. Sign in as rosa, then **click** Add a book: the form opens.

Ask yourself: signed in as rosa, you type `/books/new` into the address bar instead of clicking. Where do you land, and why? (Look at S6.)

<details>
<summary>Hint: the guard</summary>

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStore } from './token-store';

export const librarianGuard: CanActivateFn = () => {
  const tokenStore = inject(TokenStore);
  const router = inject(Router);

  if (tokenStore.isLibrarian()) {
    return true;
  }

  return router.parseUrl(
    tokenStore.isAuthenticated() ? '/books' : '/login',
  );
};
```

</details>

<details>
<summary>Hint: a test</summary>

```ts
// The guard ignores the route, so empty stand-ins will do.
const runGuard = () =>
  executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

it('sends a reader back to the catalogue (S5)', () => {
  TestBed.inject(TokenStore).setToken(
    makeToken({ sub: 'sam', roles: ['READER'] }),
  );

  expect(String(runGuard())).toBe('/books');
});
```

</details>

## L3. Show who is signed in (S2, S5, S6)

1. **Tests first**, in `app.spec.ts`. Set the token **before** you create `App`:
   - signed in as rosa, the page shows "Signed in as rosa (LIBRARIAN)" and "Add a book" (S2);
   - signed in as sam, the page does **not** show "Add a book" (S5). (`expect(text).not.toContain(...)`)
2. **Green**, in `App`:
   - inject `TokenStore` (make it `protected` so the template can use it);
   - when signed in, show "Signed in as *name* (*roles*)" and a **Sign out** button;
   - show the Add a book link only to a librarian;
   - show a **Sign in** link (to `/login`) only when signed out.
3. **Sign out** (S6): a `signOut()` method that clears the token store and goes to `/books`.
4. **Browser:** sign in as rosa, then as sam, then sign out. Then sign in and reload.

<details>
<summary>Hint: a test</summary>

```ts
it('shows who is signed in (S2)', async () => {
  TestBed.inject(TokenStore).setToken(
    makeToken({ sub: 'rosa', roles: ['LIBRARIAN'] }),
  );
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();

  const page = fixture.nativeElement as HTMLElement;
  expect(page.textContent).toContain('Signed in as rosa (LIBRARIAN)');
  expect(page.textContent).toContain('Add a book');
});
```

</details>

<details>
<summary>Hint: the template and signOut()</summary>

```html
<nav>
  <a routerLink="/books" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Catalogue</a>
  @if (tokenStore.isLibrarian()) {
    <a routerLink="/books/new" routerLinkActive="active">Add a book</a>
  }
  @if (!tokenStore.isAuthenticated()) {
    <a routerLink="/login" routerLinkActive="active">Sign in</a>
  }
</nav>
@if (tokenStore.isAuthenticated()) {
  <p class="session">
    Signed in as {{ tokenStore.currentUsername() }}
    ({{ tokenStore.currentRoles().join(', ') }})
    <button (click)="signOut()">Sign out</button>
  </p>
}
```

```ts
// in app.ts; inject Router too
protected signOut(): void {
  this.tokenStore.clear();
  this.router.navigate(['/books']);
}
```

</details>

## L4. Two tests that pass the first time (S2, S4)

Monday's rule: *a test you have only seen pass might test nothing.* These two test code from class, so they should pass straight away. Prove each one can fail.

1. In `login-page.spec.ts`: after a good sign-in, the token store knows rosa (S2). Answer the request with `{ accessToken: <a token from makeToken()>, refreshToken: 'r' }`, `settle()`, then check `TokenStore`'s `currentUsername()`.
2. In `auth-interceptor.spec.ts`: a request to the sign-in service (`AUTH_API`) has **no** `Authorization` header (S4).
3. For each: green? Now break the code on purpose (remove the `setToken(...)` line; remove `req.url.startsWith(LIBRARY_API)`). Red? Put it back.

Ask yourself: why does it matter that the token never goes anywhere but the Library service?

<details>
<summary>Hint: the interceptor test</summary>

```ts
it('keeps the token from the sign-in service (S4)', () => {
  http.post(AUTH_API, {}).subscribe();

  const request = httpTesting.expectOne(AUTH_API);
  const headers = request.request.headers;
  expect(headers.has('Authorization')).toBe(false);
});
```

</details>

## L5. Playwright

Run `npx playwright test`, with all three servers running. The AC6 test now **fails**. Before you read on, work out why.

1. Fix it: sign in as rosa at `/login` first, then **click** Add a book. (Why not `page.goto('/books/new')`?)
2. Add `e2e/sign-in.spec.ts` with one test per criterion you can see in a browser:
   - S1: open `/books/new` signed out; expect the URL to end in `/login`;
   - S3: a wrong password shows the error, and the header does not say "Signed in";
   - S2 and S6: rosa signs in, sees "Signed in as rosa (LIBRARIAN)", clicks Sign out, and the nav no longer has Add a book;
   - S5: sam signs in and the nav has no Add a book.

<details>
<summary>Hint</summary>

```ts
import { expect, Page, test } from '@playwright/test';

async function signIn(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type=submit]');
}

test('a signed-out visitor is sent to sign in (S1)', async ({ page }) => {
  await page.goto('/books/new');

  await expect(page).toHaveURL(/\/login$/);
});
```

To click the link in the nav, and not a heading with the same words: `page.click('nav >> text=Add a book')`.

</details>

## Last: what the lock does not do

Sign out, then run this in a terminal (change the title if you run it twice):

```bash
curl -i -X POST localhost:8080/api/books \
  -H 'Content-Type: application/json' \
  -d '{"title":"No Token Needed","author":"Anyone","year":2026}'
```

What status comes back? What does that tell you about hiding the Add a book link? Write your answer down; we start there on Thursday.

---

## Check yourself

Answer these without looking anything up. If one is shaky, ask.

1. Where is the token kept, and what happens to it when you reload? Why might we choose that?
2. The app read rosa's name and roles from the token without any secret. So what stops sam from editing his token to say `LIBRARIAN`?
3. Why does the interceptor look at the URL before it adds the token?
4. What can a guard return, and what does the router do with each?
5. After the `curl` above: is hiding a link security? Where must the real check live?

## Stuck?

| Symptom | Likely cause |
|---|---|
| Sign-in says "Could not reach the sign-in service." | The stub is not running, or not on 3000. Check: `curl -s localhost:3000/health` |
| `node server.js` fails with `EADDRINUSE` | Something else is on port 3000. Stop it first |
| Signed in, typed `/books/new`, landed on Sign in | Expected (S6): typing a URL loads the app again, and the token was only in memory. Click the link instead |
| `NG0201: No provider found for ActivatedRoute` in a test | The component has a `routerLink`: add `provideRouter([])` to that spec's providers |
| `NG0203: inject() must be called from an injection context` in the guard spec | Call the guard through `executeGuard`, which uses `TestBed.runInInjectionContext` |
| The App test still shows "Sign in" after `setToken()` | Set the token before `createComponent`, or `await fixture.whenStable()` after it |
| No `Authorization` header in the Network tab | You are signed out (did you reload?), or `withInterceptors([authInterceptor])` is missing from `app.config.ts` |
| Playwright waits on `#title` and times out | The guard sent it to `/login`. That is L5 |

---

## Catch up to the end of the demo

Use these only if you fell behind in class. The `library-auth-stub/` folder is already in the repo.

<details>
<summary>testing/make-token.ts (a helper for tests)</summary>

```ts
// For tests only: a token-shaped string,
// header.payload.signature. The browser reads only the middle
// part and never checks the signature (the service does), so
// the other two parts can be anything.
export function makeToken(claims: object): string {
  const payload = btoa(JSON.stringify(claims));
  return `header.${payload}.signature`;
}
```

</details>

<details>
<summary>token-store.ts and token-store.spec.ts</summary>

Generated with `npx ng g s token-store`.

```ts
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
```

```ts
import { TestBed } from '@angular/core/testing';

import { makeToken } from './testing/make-token';
import { TokenStore } from './token-store';

const ROSA = makeToken({ sub: 'rosa', roles: ['LIBRARIAN'] });

describe('TokenStore', () => {
  let store: TokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(TokenStore);
  });

  it('starts signed out', () => {
    expect(store.isAuthenticated()).toBe(false);
  });

  it('setToken() reads who is signed in from the token', () => {
    store.setToken(ROSA);

    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentUsername()).toBe('rosa');
    expect(store.currentRoles()).toEqual(['LIBRARIAN']);
  });
});
```

</details>

<details>
<summary>auth-api.ts</summary>

```ts
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
```

</details>

<details>
<summary>login-page (generated with `npx ng g c login-page`)</summary>

```ts
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
```

```html
<section class="login-page">
  <h2>Sign in</h2>

  <form [formRoot]="loginForm">
    <div class="field">
      <label for="username">Username</label>
      <input id="username" [formField]="loginForm.username" />
      @if (
        loginForm.username().touched() &&
        loginForm.username().invalid()
      ) {
        @for (error of loginForm.username().errors(); track error) {
          <p class="field-error">{{ error.message }}</p>
        }
      }
    </div>

    <div class="field">
      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        [formField]="loginForm.password"
      />
      @if (
        loginForm.password().touched() &&
        loginForm.password().invalid()
      ) {
        @for (error of loginForm.password().errors(); track error) {
          <p class="field-error">{{ error.message }}</p>
        }
      }
    </div>

    <button type="submit">Sign in</button>
  </form>

  <!-- S3: the action's answer when sign-in fails. -->
  @for (error of loginForm().errors(); track error) {
    <p class="error">{{ error.message }}</p>
  }
</section>
```

```css
.error {
  color: #b00020;
  font-weight: 600;
}

form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 300px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-error {
  color: #b00020;
  font-size: 0.85rem;
  margin: 0;
}
```

```ts
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AUTH_API } from '../auth-api';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let page: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        // Any URL is fine: the page navigates after signing in.
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    page = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  // Monday's helpers: type and leave; click; let the action's
  // await finish.
  async function fill(id: string, value: string) {
    const el = page.querySelector<HTMLInputElement>('#' + id)!;
    el.value = value;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function signIn(username: string, password: string) {
    await fill('username', username);
    await fill('password', password);
    page.querySelector('button')!.click();
    await fixture.whenStable();
  }

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('says when the password is wrong (S3)', async () => {
    await signIn('rosa', 'wrong');

    httpTesting.expectOne(AUTH_API).flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
    await settle();

    expect(page.textContent).toContain(
      'Invalid username or password.',
    );
  });
});
```

</details>

<details>
<summary>app.routes.ts (the login route)</summary>

Add it before the `**` route:

```ts
  {
    path: 'login',
    loadComponent: () =>
      import('./login-page/login-page')
        .then((m) => m.LoginPage),
  },
```

</details>

<details>
<summary>auth-interceptor.ts and auth-interceptor.spec.ts</summary>

```ts
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
```

```ts
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

  it('adds the token to Library requests (S4)', () => {
    http.get(LIBRARY_API).subscribe();

    const request = httpTesting.expectOne(LIBRARY_API);
    const headers = request.request.headers;
    expect(headers.get('Authorization')).toBe(`Bearer ${ROSA}`);
  });
});
```

</details>

<details>
<summary>app.config.ts</summary>

```ts
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
```

</details>
