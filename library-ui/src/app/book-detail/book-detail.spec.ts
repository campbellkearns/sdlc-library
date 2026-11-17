import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { LIBRARY_API } from '../books-api';
import { BookDetail } from './book-detail';

const KINDRED = {
  id: 'k1',
  title: 'Kindred',
  author: 'Octavia E. Butler',
  year: 1979,
};

describe('BookDetail', () => {
  let component: BookDetail;
  let fixture: ComponentFixture<BookDetail>;
  let page: HTMLElement;
  let httpTesting: HttpTestingController;

  // The id the URL would give: the router sets it in the app,
  // the test sets it here. detectChanges() renders now, which
  // sends the request. (whenStable() would wait for an answer
  // that only the test can give.)
  function open(id: string) {
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetail);
    component = fixture.componentInstance;
    page = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should create', async () => {
    open('k1');
    expect(component).toBeTruthy();
  });

  // R2: the instructor writes this one in class.
  it('shows the book with that id (R2)', async () => {
    open('k1');

    httpTesting.expectOne(`${LIBRARY_API}/k1`).flush(KINDRED);
    await fixture.whenStable();

    expect(page.textContent).toContain('Kindred');
    expect(page.textContent).toContain('Octavia E. Butler, 1979');
  });

  // R3: the students write this one in the lab.
  it('says when there is no such book (R3)', async () => {
    open('nope');

    httpTesting.expectOne(`${LIBRARY_API}/nope`).flush(null, {
      status: 404,
      statusText: 'Not Found',
    });
    await fixture.whenStable();

    expect(page.textContent).toContain(
      'There is no book with the id nope.',
    );
  });
});
