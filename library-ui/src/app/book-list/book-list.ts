import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookCard } from '../book-card/book-card';
import { LibraryStore } from '../library-store';

@Component({
  selector: 'app-book-list',
  imports: [BookCard, RouterLink],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
})
export class BookList {
  private readonly store = inject(LibraryStore);

  protected readonly books = this.store.books;
  protected readonly count = this.store.count;

  protected remove(id: string): void {
    this.store.remove(id);
  }
}
