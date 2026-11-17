import { Component, computed, input } from '@angular/core';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Book } from '../book';
import { LIBRARY_API } from '../books-api';
import { NotFound } from '../not-found/not-found';

@Component({
  selector: 'app-book-detail',
  imports: [RouterLink, NotFound],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetail {
  // The :id in /books/:id arrives here, because app.config.ts
  // has withComponentInputBinding(). Nobody reads the URL.
  readonly id = input.required<string>();

  // One book from the service. When id() changes, it fetches
  // again (Module 14's httpResource).
  protected readonly book = httpResource<Book>(
    () => `${LIBRARY_API}/${this.id()}`,
  );

  // 404: no book has this id. 400: the id is not even a UUID.
  // Either way, there is no such book.
  protected readonly notFound = computed(() => {
    const error = this.book.error();
    return (
      error instanceof HttpErrorResponse &&
      (error.status === 404 || error.status === 400)
    );
  });
}
