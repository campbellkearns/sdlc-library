import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookList } from './book-list/book-list';
import { BookCount } from './book-count/book-count';
import { AddBook } from './add-book/add-book';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BookList, BookCount, AddBook],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Library');
}
