import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFound } from './not-found';

describe('NotFound', () => {
  let fixture: ComponentFixture<NotFound>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    page = fixture.nativeElement;
  });

  it('says the page does not exist (R5)', async () => {
    await fixture.whenStable();

    expect(page.textContent).toContain('That page does not exist.');
  });

  it('shows the message it is given (R3)', async () => {
    fixture.componentRef.setInput('message', 'No such book.');
    await fixture.whenStable();

    expect(page.textContent).toContain('No such book.');
  });
});
