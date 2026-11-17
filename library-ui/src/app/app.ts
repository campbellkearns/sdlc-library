import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BookCount } from './book-count/book-count';
import { BooksApi } from './books-api';
import { LibraryStore } from './library-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BookCount],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly api = inject(BooksApi);
  private readonly store = inject(LibraryStore);

  protected readonly title = signal('Library');
  protected readonly loadError = signal<string | null>(null);

  constructor() {
    // AC6: the shelf starts from the Library service, so a
    // saved book is still there after a reload.
    this.api
      .list()
      .then((books) => this.store.setAll(books))
      .catch(() =>
        this.loadError.set('Could not load the catalogue.'),
      );
  }
}
