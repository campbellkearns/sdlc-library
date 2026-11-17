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

  it('starts with five books', () => {
    expect(store.count()).toBe(5);
  });

  it('removes a book by id', () => {
    store.remove('b1');
    expect(store.count()).toBe(4);
    expect(store.books().some((b) => b.id === 'b1')).toBe(false);
  });

  // LIB-2, AC4
  it('add() puts the book at the end of the shelf', () => {
    const before = store.count();
    const sower = makeBook();

    store.add(sower);

    expect(store.count()).toBe(before + 1);
    expect(store.books().at(-1)).toEqual(sower);
  });
});
