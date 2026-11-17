import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Book, BookRequest } from './book';

// The Library service from Week 4.
export const LIBRARY_API = 'http://localhost:8080/api/books';

@Service()
export class BooksApi {
  private readonly http = inject(HttpClient);

  // AC4: the service checks the rules again, chooses the id,
  // and answers 201 with the saved book. A Promise, so the
  // form's submission action can await it.
  create(request: BookRequest): Promise<Book> {
    return firstValueFrom(
      this.http.post<Book>(LIBRARY_API, request),
    );
  }
}
