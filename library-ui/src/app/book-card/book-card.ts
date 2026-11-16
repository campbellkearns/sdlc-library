import { Component, input } from '@angular/core';
import { Book } from '../book';

@Component({
  selector: 'app-book-card',
  imports: [],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
})
export class BookCard {
  // Data flows down: the parent supplies it, this component only reads it.
  // Public (no "protected") because the parent has to be able to bind to it.
  readonly book = input.required<Book>();
}
