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
import { makeToken } from '../testing/make-token';
import { TokenStore } from '../token-store';
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

  // The instructor writes this one in class.
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

  // The students write this one in the lab.
  it('keeps the token after a good sign-in (S2)', async () => {
    const token = makeToken({
      sub: 'rosa',
      roles: ['LIBRARIAN'],
    });
    await signIn('rosa', 'librarian123');

    httpTesting
      .expectOne(AUTH_API)
      .flush({ accessToken: token, refreshToken: 'r' });
    await settle();

    const store = TestBed.inject(TokenStore);
    expect(store.currentUsername()).toBe('rosa');
  });
});
