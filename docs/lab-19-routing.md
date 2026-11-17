# Lab 19: Routing the Library

In class we gave the catalogue (`/books`), the add form (`/books/new`) and one book (`/books/:id`) their own URLs. You finish the job: a page for URLs that don't exist, an honest answer for a book that doesn't exist, a nav that tells the truth, and one question about route order.

Work **test first**, as on Monday: red, green, refactor.

## Where to start

- **You followed the demo:** carry on in your own repo.
- **You fell behind in the demo:** the files are in "Catch up to the end of the demo" at the bottom.
- **You never finished LIB-2:** commit or stash your work, then `git fetch` and `git checkout lib-2-done`, and catch up to the end of the demo from there.

Three terminals, as before: the Library service (`mvn spring-boot:run`), `npx ng serve`, `npx ng test`.

## The acceptance criteria

- **R1.** Opening `/` takes me to `/books`, the catalogue. *(done in class)*
- **R2.** Each book has a Details link to `/books/<id>`, which shows its title, author and year. *(done in class)*
- **R3.** `/books/<an id nobody has>` says "There is no book with the id `<id>`."
- **R4.** Add a book lives at `/books/new`, from the nav. *(the route is done; the nav is yours)*
- **R5.** Any other URL, like `/nope`, says "That page does not exist."
- **R6.** Moving between screens never reloads the page: the header and its count stay. *(done in class)*

---

## L1. A page for any other URL (R5)

1. Generate a `NotFound` component (`npx ng g c not-found`). Give it a `message` input whose default is `'That page does not exist.'`, and show it under a "Not found" heading, with a link back to `/books`.
2. **Tests first**, in `not-found.spec.ts`:
   - it shows the default message;
   - it shows a message it is given (set it with `fixture.componentRef.setInput('message', '...')`).

   Your template has a `routerLink`, so the spec needs `providers: [provideRouter([])]`. You saw that `NG0201` in class.
3. Add the `**` route to `app.routes.ts`. Where does it go in the list, and why?
4. **Browser:** `/nope` shows "That page does not exist." (R5).

<details>
<summary>Hint: the input and the route</summary>

```ts
// in not-found.ts
readonly message = input('That page does not exist.');
```

```ts
// last in app.routes.ts: it matches any URL no route above matched
{
  path: '**',
  loadComponent: () => import('./not-found/not-found').then((m) => m.NotFound),
},
```

</details>

## L2. No such book (R3)

Try it first in the browser: `/books/0b6f2c1e-1a2b-4c3d-8e4f-000000000099` (an id nobody has) and `/books/abc` (not even an id). Both say "Could not load this book." That is not good enough for Rosa.

1. **Test first**, in `book-detail.spec.ts`: open `'nope'`, answer the request with a 404, and expect "There is no book with the id nope." on the page. Red?
2. **Green:** in `BookDetail`, work out from `book.error()` whether there is no such book. The service answers **404** for an id it does not know, and **400** when the id is not a UUID. Show your `NotFound` with its own message in that case.
3. **Browser:** both URLs above now say "There is no book with the id ...".

Ask yourself: one of those two answers comes from the router, one from the service, or both from the service?

<details>
<summary>Hint: the test</summary>

```ts
it('says when there is no such book (R3)', async () => {
  open('nope');

  httpTesting.expectOne(`${LIBRARY_API}/nope`).flush(null, {
    status: 404,
    statusText: 'Not Found',
  });
  await fixture.whenStable();

  expect(page.textContent).toContain('There is no book with the id nope.');
});
```

</details>

<details>
<summary>Hint: the component</summary>

```ts
// in book-detail.ts; import computed, HttpErrorResponse and NotFound
protected readonly notFound = computed(() => {
  const error = this.book.error();
  return (
    error instanceof HttpErrorResponse &&
    (error.status === 404 || error.status === 400)
  );
});
```

```html
<!-- in book-detail.html, around what is already there -->
@if (notFound()) {
  <app-not-found [message]="'There is no book with the id ' + id() + '.'" />
} @else {
  <!-- the error / book / loading branches and the back link -->
}
```

</details>

## L3. Does route order matter? (predict, then try)

In `app.routes.ts`, move the `books/:id` route **above** `books/new`.

**Predict** what `/books/new` shows now. Then try it, and explain what you see. (Hint: what is the id?) Put it back, and add a one-line comment above `books/new` so nobody moves it again.

## L4. A nav that tells the truth (R4)

Go to `/books/new`. Look at the nav: **both** links look active. Why? (`routerLinkActive` matches the start of the URL.)

Fix it on the Catalogue link only, with `[routerLinkActiveOptions]="{ exact: true }"`. Check both pages.

## L5. Playwright (only if you added it in LIB-2)

Your end-to-end test opens `/` and types into the form, but the form now lives at `/books/new`. Update the test so that it:

1. opens `/books/new`, fills in and saves a book (with a new title each run);
2. clicks the **Catalogue** link and sees the title in `.book-list`;
3. reloads and still sees it.

Run it with `npx playwright test`, with both servers running.

<details>
<summary>Hint</summary>

```ts
await page.goto('/books/new');
// ... fill, click Save, expect the .result message ...
await page.click('text=Catalogue');
await expect(page.locator('.book-list')).toContainText(title);
await page.reload();
await expect(page.locator('.book-list')).toContainText(title);
```

</details>

---

## Check yourself

Answer these without looking anything up. If one is shaky, ask before Module 20: it builds on routes.

1. Where does a routed component appear on the page?
2. What happens at start-up if you remove `pathMatch: 'full'` from the `''` redirect? (Try it; read the error; put it back.)
3. How does the id in `/books/<id>` reach `BookDetail`? Name the two pieces that make it happen.
4. Why must `**` be the last route?

## Stuck?

| Symptom | Likely cause |
|---|---|
| `NG0201: No provider found for ActivatedRoute` in a test | The component uses `routerLink`: add `providers: [provideRouter([])]` (or `provideRouter(routes)`) |
| The `BookDetail` test times out | Use `open()`, which calls `detectChanges()`. `whenStable()` waits for the request your test has not answered yet |
| `id` is `undefined` in `BookDetail` | `withComponentInputBinding()` is missing from `provideRouter` in `app.config.ts` |
| `/books/new` shows "There is no book with the id new." | `books/:id` is above `books/new` (that is L3) |
| Both nav links are bold | L4 |
| Clicking a link reloads the whole page | You used `href` instead of `routerLink` |

---

## Catch up to the end of the demo

Use these only if you fell behind in class.

<details>
<summary>app.routes.ts</summary>

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  {
    path: 'books',
    loadComponent: () => import('./book-list/book-list').then((m) => m.BookList),
  },
  {
    path: 'books/new',
    loadComponent: () => import('./add-book/add-book').then((m) => m.AddBook),
  },
  {
    path: 'books/:id',
    loadComponent: () => import('./book-detail/book-detail').then((m) => m.BookDetail),
  },
];
```

</details>

<details>
<summary>app.config.ts (the router line)</summary>

```ts
import { provideRouter, withComponentInputBinding } from '@angular/router';
// ...
provideRouter(routes, withComponentInputBinding()),
```

</details>

<details>
<summary>app.html, app.ts, app.css</summary>

```html
<header>
  <h1>{{ title() }}</h1>
  <nav>
    <a routerLink="/books" routerLinkActive="active">Catalogue</a>
    <a routerLink="/books/new" routerLinkActive="active">Add a book</a>
  </nav>
  <app-book-count />
</header>

<main>
  @if (loadError(); as message) {
    <p class="load-error">{{ message }}</p>
  }

  <router-outlet />
</main>
```

In `app.ts`: `imports: [RouterOutlet, RouterLink, RouterLinkActive, BookCount]`, with `RouterOutlet`, `RouterLink` and `RouterLinkActive` imported from `@angular/router`. Remove `AddBook` and `BookList`.

```css
nav {
  display: flex;
  gap: 16px;
}

nav a {
  color: inherit;
  text-decoration: none;
}

nav a.active {
  font-weight: bold;
  text-decoration: underline;
}
```

</details>

<details>
<summary>app.spec.ts (the changes)</summary>

Add `provideRouter(routes)` to the providers (import `provideRouter` from `@angular/router` and `routes` from `./app.routes`). In the AC6 test, the list is no longer on App's page, so check the header count instead:

```ts
const page = fixture.nativeElement as HTMLElement;
expect(page.textContent).toContain('Books: 2');
```

</details>

<details>
<summary>book-detail.ts and book-detail.html</summary>

```ts
import { Component, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Book } from '../book';
import { LIBRARY_API } from '../books-api';

@Component({
  selector: 'app-book-detail',
  imports: [RouterLink],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetail {
  // The :id in /books/:id arrives here, from the URL.
  readonly id = input.required<string>();

  // One book from the service. When id() changes, it fetches again.
  protected readonly book = httpResource<Book>(() => `${LIBRARY_API}/${this.id()}`);
}
```

```html
<section class="book-detail">
  @if (book.error()) {
    <p class="error">Could not load this book.</p>
  } @else if (book.value(); as b) {
    <h2>{{ b.title }}</h2>
    <p>{{ b.author }}, {{ b.year }}</p>
  } @else {
    <p class="loading">Loading the book…</p>
  }
  <p><a routerLink="/books">Back to the catalogue</a></p>
</section>
```

</details>

<details>
<summary>book-detail.spec.ts (the set-up and the R2 test)</summary>

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { LIBRARY_API } from '../books-api';
import { BookDetail } from './book-detail';

const KINDRED = { id: 'k1', title: 'Kindred', author: 'Octavia E. Butler', year: 1979 };

describe('BookDetail', () => {
  let component: BookDetail;
  let fixture: ComponentFixture<BookDetail>;
  let page: HTMLElement;
  let httpTesting: HttpTestingController;

  // Sets the id as the router would, then renders now, which sends the request.
  // (whenStable() would wait for an answer that only the test can give.)
  function open(id: string) {
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDetail],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetail);
    component = fixture.componentInstance;
    page = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    open('k1');
    expect(component).toBeTruthy();
  });

  it('shows the book with that id (R2)', async () => {
    open('k1');

    httpTesting.expectOne(`${LIBRARY_API}/k1`).flush(KINDRED);
    await fixture.whenStable();

    expect(page.textContent).toContain('Kindred');
    expect(page.textContent).toContain('Octavia E. Butler, 1979');
  });
});
```

</details>

<details>
<summary>book-list (the Details link)</summary>

In `book-list.html`, after `<app-book-card [book]="book" />`:

```html
<a [routerLink]="['/books', book.id]">Details</a>
```

Add `RouterLink` to `BookList`'s `imports`, and `providers: [provideRouter([])]` to `book-list.spec.ts`.

</details>
