import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { App } from './app';
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
      // App asks the Library service for the catalogue as it
      // starts (AC6). A unit test should not reach a real
      // server: the testing HttpClient never sends anything.
      providers: [
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

  // LIB-2, AC6
  it('shows the catalogue from the service (AC6)', async () => {
    const fixture = TestBed.createComponent(App);
    const httpTesting = TestBed.inject(HttpTestingController);

    httpTesting.expectOne(LIBRARY_API).flush([DUNE, KINDRED]);
    await fixture.whenStable();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Dune');
    expect(page.textContent).toContain('Kindred');
  });
});
