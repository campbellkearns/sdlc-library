import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot, required, pattern, maxLength, min, max } from '@angular/forms/signals';
import { Book } from '../book';

interface BookForm {
  title: string;
  author: string;
  year: number | null;
}
// A fresh, empty form each time it is called.
function emptyBook(): BookForm {
  return { title: '', author: '', year: null };
}

const NOT_BLANK = /\S/;
const YEAR_RANGE = 'Year must be from 1 to 2100.';

@Component({
  imports: [FormField, FormRoot],
  selector: 'app-add-book',
  styleUrl: './add-book.css',
  templateUrl: './add-book.html',
})
export class AddBook {
  protected readonly lastAdded = signal<Book | null>(null);
  // The model is a plain signal. The form is a view over it.
  protected readonly bookModel = signal<BookForm>(emptyBook());
  protected readonly bookForm = form(this.bookModel, (book) => {
    // AC1: the service's @NotBlank.
    required(book.title, { message: 'Title is required.' });
    pattern(book.title, NOT_BLANK, {
      message: 'Title is required.',
    });
    maxLength(book.title, 200, {
      message: 'Title must be at most 200 characters.',
    });

    required(book.author, { message: 'Author is required' });
    pattern(book.author, NOT_BLANK, {
      message: 'Author is required.',
    });
    maxLength(book.author, 200, {
      message: 'Author must be at most 200 characters.',
    });

    required(book.year, { message: 'Year is required.' });
    min(book.year, 1, { message: YEAR_RANGE });
    max(book.year, 2100, { message: YEAR_RANGE });
  });
}
