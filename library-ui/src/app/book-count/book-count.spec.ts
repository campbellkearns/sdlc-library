import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCount } from './book-count';

describe('BookCount', () => {
  let component: BookCount;
  let fixture: ComponentFixture<BookCount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCount],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCount);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
