import { TestBed } from '@angular/core/testing';

import { Book } from './book';
import { LibraryStore } from './library-store';

// A valid book. A test names only the fields it cares about.
function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'b6',
    title: 'Parable of the Sower',
    author: 'Octavia E. Butler',
    year: 1993,
    ...overrides,
  };
}

describe('LibraryStore', () => {
  let store: LibraryStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(LibraryStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  // Was "starts with five books". The shelf now comes from
  // the Library service (AC6).
  it('starts empty until the catalogue arrives', () => {
    expect(store.count()).toBe(0);
  });

  // Now arranges its own books, not the old fake shelf.
  it('removes a book by id', () => {
    store.setAll([
      makeBook({ id: 'b1' }),
      makeBook({ id: 'b2' }),
    ]);

    store.remove('b1');

    const ids = store.books().map((b) => b.id);
    expect(ids).toEqual(['b2']);
  });

  // LIB-2, AC4
  it('add() puts the book at the end of the shelf', () => {
    const before = store.count();
    const sower = makeBook();

    store.add(sower);

    expect(store.count()).toBe(before + 1);
    expect(store.books().at(-1)).toEqual(sower);
  });

  // LIB-2, AC6
  it('setAll() replaces the shelf with the catalogue', () => {
    store.add(makeBook({ id: 'old' }));

    store.setAll([
      makeBook({ id: 'x1' }),
      makeBook({ id: 'x2' }),
    ]);

    const ids = store.books().map((b) => b.id);
    expect(ids).toEqual(['x1', 'x2']);
  });
});
