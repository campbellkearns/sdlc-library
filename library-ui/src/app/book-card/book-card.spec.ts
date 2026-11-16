import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCard } from './book-card';

describe('BookCard', () => {
  let component: BookCard;
  let fixture: ComponentFixture<BookCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCard],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCard);
    // The book input is required, so give it a value before the first render.
    fixture.componentRef.setInput('book', { id: 'b1', title: 'Dune', author: 'Frank Herbert', year: 1965 });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have books on load', () => {

  })
});
