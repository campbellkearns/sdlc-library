import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBook } from './add-book';

describe('AddBook', () => {
  let component: AddBook;
  let fixture: ComponentFixture<AddBook>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBook],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBook);
    component = fixture.componentInstance;
    page = fixture.nativeElement;
    await fixture.whenStable();
  });

  async function fill(id: string, value: string) {
    const el = page.querySelector<HTMLInputElement>('#' + id)!;
    el.value = value;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires a title [AC1]', async () => {
    await fill('title', '');
    expect(page.textContent).toContain('Title is required.');
  });

  it('treats only spaces as empty [AC1]', async () => {
    await fill('title', '   ');
    expect(page.textContent).toContain('Title is required.');
  });

  it('accepts a title of 200 characters exactly [AC2]', async () => {
    await fill('title', 'x'.repeat(200));
    expect(page.querySelector('.field-error')).toBeNull();
  });

  it('refuses a title of 201 characters [AC2]', async () => {
    await fill('title', 'x'.repeat(201));
    expect(page.textContent).toContain('Title must be at most 200 characters.');
  });

  it('requires an author [AC1]', async () => {
    await fill('author', '   ');
    expect(page.textContent).toContain('Author is required');
  });

  it('refuses an author of 201 characters (AC2)', async () => {
    await fill('author', 'x'.repeat(201));
    expect(page.textContent).toContain('Author must be at most 200 characters.');
  });

  it('requires a year (AC3)', async () => {
    await fill('year', '');
    expect(page.textContent).toContain('Year is required.');
  });
  it('refuses a year outside 1 to 2100 (AC3)', async () => {
    await fill('year', '2101');
    expect(page.textContent).toContain('Year must be from 1 to 2100.');
  });

  it('accepts the years 1 and 2100 (AC3)', async () => {
    await fill('year', '1');
    expect(page.querySelector('.field-error')).toBeNull();
    await fill('year', '2100');
    expect(page.querySelector('.field-error')).toBeNull();
  });
});
