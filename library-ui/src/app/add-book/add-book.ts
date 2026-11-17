import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  form,
  FormField,
  FormRoot,
  max,
  maxLength,
  min,
  pattern,
  required,
} from '@angular/forms/signals';
import { Book } from '../book';
import { BooksApi } from '../books-api';
import { LibraryStore } from '../library-store';

// The form's model. An empty number input holds null,
// so year allows null here.
interface BookForm {
  title: string;
  author: string;
  year: number | null;
}

// A fresh, empty form each time it is called.
function emptyBook(): BookForm {
  return { title: '', author: '', year: null };
}

// At least one character that is not a space. pattern()
// skips an empty value: required() reports that one.
const NOT_BLANK = /\S/;
const YEAR_RANGE = 'Year must be from 1 to 2100.';

// AC5 and AC7: what the librarian reads when the save fails.
function saveErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 409) {
      return 'This book is already in the catalogue.';
    }
    // Status 0: no answer at all. The service is stopped,
    // or the browser blocked the call (CORS).
    if (error.status === 0) {
      return 'Could not reach the Library service.';
    }
  }
  return 'The book could not be saved.';
}

@Component({
  selector: 'app-add-book',
  imports: [FormField, FormRoot],
  templateUrl: './add-book.html',
  styleUrl: './add-book.css',
})
export class AddBook {
  private readonly api = inject(BooksApi);
  private readonly store = inject(LibraryStore);

  protected readonly lastAdded = signal<Book | null>(null);

  // The model is a plain signal. The form is a view over it.
  protected readonly bookModel = signal<BookForm>(emptyBook());

  protected readonly bookForm = form(
    this.bookModel,
    (book) => {
      // AC1, AC2: the service's @NotBlank @Size(max = 200).
      required(book.title, { message: 'Title is required.' });
      pattern(book.title, NOT_BLANK, {
        message: 'Title is required.',
      });
      maxLength(book.title, 200, {
        message: 'Title must be at most 200 characters.',
      });

      required(book.author, { message: 'Author is required.' });
      pattern(book.author, NOT_BLANK, {
        message: 'Author is required.',
      });
      maxLength(book.author, 200, {
        message: 'Author must be at most 200 characters.',
      });

      // AC3: the service's @Min(1) @Max(2100).
      required(book.year, { message: 'Year is required.' });
      min(book.year, 1, { message: YEAR_RANGE });
      max(book.year, 2100, { message: YEAR_RANGE });
    },
    {
      submission: {
        // Runs only when every rule passes.
        // Return nothing for success, or an error to show.
        action: async (field) => {
          const v = field().value();
          try {
            const saved = await this.api.create({
              title: v.title,
              author: v.author,
              year: Number(v.year),
            });
            this.store.add(saved); // AC4
            this.lastAdded.set(saved);
            // Empty fields again, and nothing "touched".
            field().reset(emptyBook());
            return;
          } catch (error) {
            this.lastAdded.set(null);
            // AC5, AC7: one message for the whole form.
            const message = saveErrorMessage(error);
            return { kind: 'server', message };
          }
        },
      },
    },
  );
}
