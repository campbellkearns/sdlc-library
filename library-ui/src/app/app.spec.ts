import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { App } from './app';
import { routes } from './app.routes';
import { Book } from './book';
import { LIBRARY_API } from './books-api';

const DUNE: Book = {
  id: 'd1',
  title: 'Dune',
  author: 'Frank Herbert',
  year: 1965,
};
const KINDRED: Book = {
  id: 'k1',
  title: 'Kindred',
  author: 'Octavia E. Butler',
  year: 1979,
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        // The nav's routerLinks need the router, as in app.config.ts.
        provideRouter(routes),
        // App asks the Library service for the catalogue as it
        // starts (AC6). The testing HttpClient sends nothing.
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Library');
  });

  // LIB-2, AC6. The list now lives on the /books route, not in
  // App's template. What App still shows is the count in the
  // header: two books from the service make it "Books: 2".
  it('loads the catalogue from the service (AC6)', async () => {
    const fixture = TestBed.createComponent(App);
    const httpTesting = TestBed.inject(HttpTestingController);

    httpTesting.expectOne(LIBRARY_API).flush([DUNE, KINDRED]);
    await fixture.whenStable();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Books: 2');
  });
});
