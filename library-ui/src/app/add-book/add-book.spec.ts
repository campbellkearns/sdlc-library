import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { LIBRARY_API } from '../books-api';
import { LibraryStore } from '../library-store';
import { AddBook } from './add-book';

const KINDRED = {
  title: 'Kindred',
  author: 'Octavia E. Butler',
  year: 1979,
};

describe('AddBook', () => {
  let component: AddBook;
  let fixture: ComponentFixture<AddBook>;
  let page: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBook],
      // The testing HttpClient sends nothing. A test answers
      // each request itself, with HttpTestingController.
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBook);
    component = fixture.componentInstance;
    page = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  // Types into a field and leaves it, as a person would.
  async function fill(id: string, value: string) {
    const el = page.querySelector<HTMLInputElement>('#' + id)!;
    el.value = value;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function fillValidBook() {
    await fill('title', KINDRED.title);
    await fill('author', KINDRED.author);
    await fill('year', String(KINDRED.year));
  }

  // Clicks Save, as a person would.
  async function save() {
    page.querySelector('button')!.click();
    await fixture.whenStable();
  }

  // The save awaits the server's answer. Let it finish, then
  // let the page catch up.
  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---- The rules: AC1 to AC3 ----

  it('requires a title (AC1)', async () => {
    await fill('title', '');

    expect(page.textContent).toContain('Title is required.');
  });

  it('treats only spaces as empty (AC1)', async () => {
    await fill('title', '   ');

    expect(page.textContent).toContain('Title is required.');
  });

  it('accepts a title of 200 characters (AC2)', async () => {
    await fill('title', 'x'.repeat(200));

    expect(page.querySelector('.field-error')).toBeNull();
  });

  it('refuses a title of 201 characters (AC2)', async () => {
    await fill('title', 'x'.repeat(201));

    expect(page.textContent).toContain(
      'Title must be at most 200 characters.',
    );
  });

  it('requires an author (AC1)', async () => {
    await fill('author', '   ');

    expect(page.textContent).toContain('Author is required.');
  });

  it('refuses an author of 201 characters (AC2)', async () => {
    await fill('author', 'x'.repeat(201));

    expect(page.textContent).toContain(
      'Author must be at most 200 characters.',
    );
  });

  it('requires a year (AC3)', async () => {
    await fill('year', '');

    expect(page.textContent).toContain('Year is required.');
  });

  it('refuses a year outside 1 to 2100 (AC3)', async () => {
    await fill('year', '2101');

    expect(page.textContent).toContain(
      'Year must be from 1 to 2100.',
    );
  });

  it('accepts the years 1 and 2100 (AC3)', async () => {
    await fill('year', '1');
    expect(page.querySelector('.field-error')).toBeNull();

    await fill('year', '2100');
    expect(page.querySelector('.field-error')).toBeNull();
  });

  // ---- Saving: AC4, AC5, AC7 ----

  it('sends nothing while a rule is broken (AC1)', async () => {
    await fill('title', '');
    await save();

    httpTesting.expectNone(LIBRARY_API);
  });

  it('sends the book to the service (AC4)', async () => {
    await fillValidBook();
    await save();

    const request = httpTesting.expectOne(LIBRARY_API);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(KINDRED);
  });

  it('shows the saved book and shelves it (AC4)', async () => {
    const store = TestBed.inject(LibraryStore);
    const before = store.count();
    await fillValidBook();
    await save();

    const request = httpTesting.expectOne(LIBRARY_API);
    request.flush({ id: 'k1', ...KINDRED });
    await settle();

    expect(page.textContent).toContain('Added Kindred');
    expect(store.count()).toBe(before + 1);
  });

  it('explains a duplicate (AC5)', async () => {
    await fillValidBook();
    await save();

    const request = httpTesting.expectOne(LIBRARY_API);
    request.flush(null, {
      status: 409,
      statusText: 'Conflict',
    });
    await settle();

    expect(page.textContent).toContain(
      'This book is already in the catalogue.',
    );
  });

  it('explains no answer from the service (AC7)', async () => {
    await fillValidBook();
    await save();

    const request = httpTesting.expectOne(LIBRARY_API);
    request.error(new ProgressEvent('error'));
    await settle();

    expect(page.textContent).toContain(
      'Could not reach the Library service.',
    );
  });
});
