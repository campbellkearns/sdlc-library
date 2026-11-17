import { Service, signal, computed } from '@angular/core';
import { Book } from './book';

@Service()
export class LibraryStore {
  // The only writable copy of the list. private: nothing outside this class can call .set() on it.
  // In the real Library the service makes the ids (UUIDs). Short ids keep today's demo readable.
  private readonly shelf = signal<Book[]>([
    {
      id: 'b1',
      title: 'The Heaven & Earth Grocery Store',
      author: 'James McBride',
      year: 2023,
    },
    {
      id: 'b2',
      title: 'Emergent Strategy',
      author: 'adrienne maree brown',
      year: 2017,
    },
    {
      id: 'b3',
      title: 'The Will to Change',
      author: 'bell hooks',
      year: 2004,
    },
    {
      id: 'b4',
      title: "The Sense of Style: The Thinking Person's Guide to Writing in the 21st Century",
      author: 'Steven Pinker',
      year: 2014,
    },
    {
      id: 'b5',
      title: 'What I Talk About When I Talk About Running',
      author: 'Haruki Murakami',
      year: 2008,
    },
  ]);

  // A read-only view: can be read, has no .set() or .update().
  readonly books = this.shelf.asReadonly();

  // Derived state: recalculated when shelf changes, cached in between.
  readonly count = computed(() => {
    return this.shelf().length;
  });

  // AC4: a saved book goes on the end of the shelf.
  // A new array, never an edit of the old one.
  add(book: Book): void {
    this.shelf.update((current) => [...current, book]);
  }

  // It builds a new array, it never edits the old one.
  remove(id: string): void {
    this.shelf.update((current) =>
      current.filter((b) => b.id !== id),
    );
  }
}
