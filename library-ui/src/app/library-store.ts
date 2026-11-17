import { Service, signal, computed } from '@angular/core';
import { Book } from './book';

@Service()
export class LibraryStore {
  // The only writable copy of the list. private: nothing
  // outside this class can call .set() on it. It starts empty:
  // the catalogue comes from the Library service (LIB-2, AC6).
  private readonly shelf = signal<Book[]>([]);

  // A read-only view: can be read, has no .set() or .update().
  readonly books = this.shelf.asReadonly();

  // Derived state: recalculated when shelf changes, cached in between.
  readonly count = computed(() => {
    return this.shelf().length;
  });

  // AC6: replace the shelf with the service's catalogue.
  setAll(books: Book[]): void {
    this.shelf.set(books);
  }

  // AC4: a saved book goes on the end of the shelf.
  // A new array, never an edit of the old one.
  add(book: Book): void {
    this.shelf.update((current) => [...current, book]);
  }

  // Local to this tab only. Removing for real is LIB-3.
  remove(id: string): void {
    this.shelf.update((current) =>
      current.filter((b) => b.id !== id),
    );
  }
}
