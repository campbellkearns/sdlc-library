import { Routes } from '@angular/router';

export const routes: Routes = [
  // An empty path means the start of the app. pathMatch: 'full'
  // redirects only the empty path, not every path.
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  {
    path: 'books',
    loadComponent: () =>
      import('./book-list/book-list').then((m) => m.BookList),
  },
  // Before books/:id, or "new" would be read as an id.
  {
    path: 'books/new',
    loadComponent: () =>
      import('./add-book/add-book').then((m) => m.AddBook),
  },
  {
    path: 'books/:id',
    loadComponent: () =>
      import('./book-detail/book-detail').then((m) => m.BookDetail),
  },
  // Last: it matches any URL that no route above matched.
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found').then((m) => m.NotFound),
  },
];
