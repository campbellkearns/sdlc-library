import { TestBed } from '@angular/core/testing';

import { LibraryStore } from './library-store';

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
});
