import { Component, inject } from '@angular/core';
import { LibraryStore } from '../library-store';

@Component({
  selector: 'app-book-count',
  imports: [],
  templateUrl: './book-count.html',
  styleUrl: './book-count.css',
})
export class BookCount {
  private readonly store = inject(LibraryStore);

  protected readonly count = this.store.count;
}
