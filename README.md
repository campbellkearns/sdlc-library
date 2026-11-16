# Library: Add a Book (LIB-2), lab

You are finishing one user story, **test first**. In class we wrote the story and its acceptance criteria, broke it into tasks, and started task T1: the title's rules already work, with four tests. Now you finish the story.

The business requirements are in [`docs/brd-excerpt.md`](docs/brd-excerpt.md).

## What is in this repo

| Folder | What |
|---|---|
| `library-service/` | The Library service from Week 4 (Spring Boot). It already refuses bad books and duplicates (409). |
| `library-ui/` | The Angular app. The Add a book form checks the title. The five books on screen are typed into `library-store.ts`. |

## Setup

You need JDK 21, Maven and Node. Use three terminals.

**1. The Library service** (port 8080; stop anything else on 8080 first):

```bash
cd library-service
cp data/books.seed.csv data/books.csv
mvn spring-boot:run
```

Check it: `curl -s localhost:8080/api/books` lists five books.

**2. The UI** (port 4200):

```bash
cd library-ui
npm install
npx ng serve
```

**3. The tests**, in watch mode:

```bash
cd library-ui
npx ng test
```

Every test should pass before you start. If watch mode does not re-run, use `npx ng test --watch=false` after each change.

## The story

> As a **librarian**, I want to **add a new book to the catalogue**, so that **readers can see the library has it**.

### Acceptance criteria

- **AC1. Required.** When the title or the author is empty or only spaces, I see "Title is required." or "Author is required." under that field, and the book is not saved.
- **AC2. Length.** When the title or the author is longer than 200 characters, I see "Title must be at most 200 characters." (or Author). Exactly 200 is accepted.
- **AC3. Year.** When the year is empty I see "Year is required.". When it is outside 1 to 2100 I see "Year must be from 1 to 2100.".
- **AC4. Saved.** Given a valid book, when I save it, I see "Added *title* by *author* (*year*).", the book appears at the end of the list, the count in the header goes up by one, and the form is empty again.
- **AC5. Duplicate.** When the catalogue already holds a book with the same title, author and year, I see "This book is already in the catalogue." and nothing is added.
- **AC6. Shared and permanent.** When I reload the page, a book I saved is still in the list.
- **AC7. Service down.** When the Library service does not answer, I see "Could not reach the Library service.".

## How to work: red, green, refactor

For every piece of behaviour:

1. **Red.** Write the test first. Run it and watch it fail. A test you have only seen pass might test nothing.
2. **Green.** Write the least code that makes it pass.
3. **Refactor.** Tidy up while the tests stay green.

Inside each test: **Arrange** the starting point, **Act** once, **Assert** what anyone could check.

### The testing tools you will use

| Tool | What it does |
|---|---|
| `TestBed.inject(X)` | Hands you a service, as `inject()` does in the app |
| `TestBed.createComponent(X)` | Renders a component; returns a fixture |
| `fixture.nativeElement` | The rendered page: query it, read its text |
| `fill(id, value)` | Our helper in `add-book.spec.ts`: types into a field and leaves it |
| `fixture.whenStable()` | Waits for Angular to update the page |
| `provideHttpClientTesting()` | An HttpClient that never sends anything |
| `HttpTestingController` | Lets a test see each request and answer it |
| `expectOne(url)` / `expectNone(url)` | Exactly one request went out, or none did |
| `request.flush(body, { status })` | The server's answer: 201, 409, ... |
| `request.error(new ProgressEvent('error'))` | No answer at all (status 0) |

---

## T1 (continued): the author and the year (AC1 to AC3)

The title is done. Look at `add-book.spec.ts` and `add-book.ts` to see how.

1. **The form only has a Title field.** Add an Author field and a Year field to `add-book.html`, in the same pattern. The year input is `type="number"`.
2. **Tests first.** In `add-book.spec.ts`, add tests that:
   - require an author (try `'   '`),
   - refuse an author of 201 characters,
   - require a year (`''`),
   - refuse a year outside 1 to 2100 (try `'2101'`),
   - accept the years 1 and 2100 (no `.field-error` on the page).

   Predict which ones are red before you run them.
3. **Green.** Add the rules in `add-book.ts` with Angular's built-in validators: the title uses `required`, `pattern` and `maxLength`. The year needs `required`, `min` and `max`. Use the exact messages from the acceptance criteria.
4. **Browser check.** Click into Author, leave it: "Author is required.". Year `2101`: the range message.

<details>
<summary>Hint: the Year field</summary>

```html
<div class="field">
  <label for="year">Year</label>
  <input id="year" type="number" step="1" [formField]="bookForm.year" />
  @if (bookForm.year().touched() && bookForm.year().invalid()) {
    @for (error of bookForm.year().errors(); track error) {
      <p class="field-error">{{ error.message }}</p>
    }
  }
</div>
```

</details>

<details>
<summary>Hint: one author test and the year's rules</summary>

```ts
it('requires an author [AC1]', async () => {
  await fill('author', '   ');

  expect(page.textContent).toContain('Author is required.');
});
```

```ts
// in the form, after the title's rules; import min and max too
required(book.year, { message: 'Year is required.' });
min(book.year, 1, { message: 'Year must be from 1 to 2100.' });
max(book.year, 2100, { message: 'Year must be from 1 to 2100.' });
```

</details>

## T2: the store can add a book (AC4)

1. **Test first**, in `library-store.spec.ts`: `add()` puts the book at the end of the shelf, and the count goes up by one.
2. **Green.** Add `add(book: Book)` to `LibraryStore`. Build a new array; never edit the old one.

Ask yourself: why compare with the count **before** the add, instead of a fixed number like 6? (You will find out in T5.)

<details>
<summary>Hint: a helper and the test</summary>

```ts
import { Book } from './book';

// A valid book. A test names only the fields it cares about.
function makeBook(overrides: Partial<Book> = {}): Book {
  return { id: 'b6', title: 'Parable of the Sower', author: 'Octavia E. Butler', year: 1993, ...overrides };
}
```

```ts
it('add() puts the book at the end of the shelf', () => {
  const before = store.count();
  const sower = makeBook();

  store.add(sower);

  expect(store.count()).toBe(before + 1);
  expect(store.books().at(-1)).toEqual(sower);
});
```

</details>

## T3: Save sends the book, with one message per outcome (AC4, AC5, AC7)

A unit test must never reach a real server. Here the test plays the Library service with `HttpTestingController`.

1. **The page.** In `add-book.html`, add a Save button inside the form (`<button type="submit">Save book</button>`). Under the form, show the form's own errors and the "Added ..." message (hint below).
2. **The test setup.** In `add-book.spec.ts`:
   - add `providers: [provideHttpClient(), provideHttpClientTesting()]` under `imports: [AddBook]`,
   - get `httpTesting = TestBed.inject(HttpTestingController)` in `beforeEach`,
   - paste the three helpers below.
3. **Tests first**, one at a time, each red before green:
   - **sends the book to the service:** `expectOne(LIBRARY_API)`, the method is `POST`, the body is the book.
   - **shows the saved book and shelves it:** answer with `flush({ id: 'k1', ...book })`, then the page shows "Added Kindred" and the store's count went up by one.
   - **explains a duplicate:** answer with a 409. The page shows "This book is already in the catalogue.".
   - **explains no answer:** `request.error(new ProgressEvent('error'))`. The page shows "Could not reach the Library service.".
   - **sends nothing while a rule is broken:** fill the title with `''`, save, then `expectNone(LIBRARY_API)`. This one starts green. Why?
4. **The code:**
   - `book.ts`: a `BookRequest` (title, author, year; no id).
   - `books-api.ts`: `LIBRARY_API = 'http://localhost:8080/api/books'` and a `BooksApi` service with `create(request): Promise<Book>` (use `firstValueFrom` around `http.post`).
   - `app.config.ts`: `provideHttpClient()`.
   - `add-book.ts`: inject `BooksApi` and `LibraryStore`, and give `form()` a third argument with a `submission` action. On success: add the book to the store, set `lastAdded`, and `field().reset(emptyBook())`. On failure: return `{ kind: 'server', message }`, with the message picked from the error's status.

<details>
<summary>The three helpers (paste these into add-book.spec.ts)</summary>

```ts
const KINDRED = { title: 'Kindred', author: 'Octavia E. Butler', year: 1979 };

async function fillValidBook() {
  await fill('title', KINDRED.title);
  await fill('author', KINDRED.author);
  await fill('year', String(KINDRED.year));
}

// Clicks Save, as a person would.
async function save() {
  page.querySelector('button')!.click();
  await fixture.whenStable();
}

// The save awaits the server's answer. Let it finish,
// then let the page catch up.
async function settle() {
  await new Promise((resolve) => setTimeout(resolve));
  await fixture.whenStable();
}
```

Put `KINDRED` above `describe`, and the three functions next to `fill`. Call `await settle()` after every `flush()` or `error()`.

</details>

<details>
<summary>Hint: the page additions</summary>

```html
<!-- under the form -->
@for (error of bookForm().errors(); track error) {
  <p class="error">{{ error.message }}</p>
}

@if (lastAdded(); as book) {
  <p class="result">Added {{ book.title }} by {{ book.author }} ({{ book.year }}).</p>
}
```

</details>

<details>
<summary>Hint: the shape of the submission action</summary>

```ts
protected readonly bookForm = form(
  this.bookModel,
  (book) => {
    // ... the rules you already have ...
  },
  {
    submission: {
      // Runs only when every rule passes.
      action: async (field) => {
        const v = field().value();
        try {
          const saved = await this.api.create({ title: v.title, author: v.author, year: Number(v.year) });
          // add to the store, set lastAdded, reset the form
          return;
        } catch (error) {
          // 409 -> duplicate message; status 0 -> unreachable message
          return { kind: 'server', message: '...' };
        }
      },
    },
  },
);
```

The error is an `HttpErrorResponse` (from `@angular/common/http`). Its `status` is 409 for a duplicate and 0 when nothing answered.

</details>

---

## Checkpoint: save a book in the browser

Every test is green. Now add a book in the browser and save it.

- What does the page say?
- Open the browser's Console and Network tabs. What do you see?
- Look in `library-service/data/books.csv`. Was anything saved?

Decide which side has to change, the UI or the service, before you open the hint.

<details>
<summary>Hint</summary>

The UI runs on `localhost:4200` and the service on `localhost:8080`. To the browser those are different origins, so before the POST it asks the service whether `localhost:4200` may call it. The service never says yes, so the browser never sends the POST, and our UI sees status 0: AC7's message. The fix belongs in the **service**: that is T4.

</details>

## T4: the Library service accepts calls from the UI (found in the browser)

Add a Spring configuration class to `library-service` that allows CORS for `/api/**`, from `http://localhost:4200` only, for `GET` and `POST` only. Restart the service.

Check it the way the browser does:

```bash
curl -i -X OPTIONS localhost:8080/api/books \
  -H 'Origin: http://localhost:4200' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

You want `Access-Control-Allow-Origin: http://localhost:4200` in the answer. Then save a book in the browser: AC4 should pass, and `books.csv` has a new row.

Why not allow every origin with `*`?

<details>
<summary>Hint</summary>

A class in `com.example.library`, annotated `@Configuration`, that implements `WebMvcConfigurer` and overrides `addCorsMappings(CorsRegistry registry)`: `registry.addMapping(...).allowedOrigins(...).allowedMethods(...)`.

</details>

## Checkpoint: reload the page

Every test is green and AC4 passes. Reload the page. Is your book still there?

What does that say about where the five books on screen come from?

## T5: the shelf starts from the Library service (AC6)

1. **Store test first:** `setAll(books)` replaces the whole shelf. Make it pass.
2. **Make the shelf start empty:** replace the five typed-in books in `library-store.ts` with `[]`. Predict which tests go red. Are the tests wrong, or the code? Fix whichever is wrong.
3. **App test first.** In `app.spec.ts`: add the testing HttpClient providers, then a test that creates `App`, answers `expectOne(LIBRARY_API)` with two books of your choice, waits with `whenStable()`, and expects both titles on the page.
4. **Green:** add `list(): Promise<Book[]>` to `BooksApi`, and in `App`'s constructor load the list into the store with `setAll`. If the load fails, show "Could not load the catalogue." on the page.
5. **Browser:** reload. The books now come from the service, including the one you saved. AC6 passes.

## Finish: check every acceptance criterion

- **AC5:** save "The Will to Change", "bell hooks", 2004. You should see the duplicate message. Now try 2005: it saves, because all three must match to be a duplicate.
- **AC7:** stop the service and save a book. You should see "Could not reach the Library service.". Start it again.
- **Break it on purpose:** comment out the title's `pattern(...)` rule. Which test goes red? Put it back.

For each acceptance criterion, name the test that proves it, or the browser check. Is there one that only the browser can prove?

## Stretch: an end-to-end test with Playwright (optional)

Unit tests check the pieces. An end-to-end test checks the whole system, in a real browser.

```bash
cd library-ui
npm i -D @playwright/test
npx playwright install chromium
```

Create `playwright.config.ts` (`testDir: './e2e'`, `use: { baseURL: 'http://localhost:4200' }`) and `e2e/add-a-book.spec.ts` with one test: open the page, fill in a book with a new title each run (for example `` `Test book ${Date.now()}` ``), save, see the "Added" message, reload, and expect the title in `.book-list`. Run it with `npx playwright test`, with both servers running.

Would this test have caught the problem you found at the reload checkpoint?

## Reset the books

With the service stopped: `cp data/books.seed.csv data/books.csv` in `library-service`.

## Stuck?

| Symptom | Likely cause |
|---|---|
| `ng test` shows a build error, not a failed test | A test uses something that does not exist yet. That is red too: write the code |
| A component test sees no error message | The field was never left (`blur`), or no `whenStable()`. Use `fill()` |
| The 201, 409 or no-answer test sees the old page | Looked too early. `await settle()` after `flush()` or `error()` |
| "Expected one matching request ... found none" | No submission action yet, or a rule is failing in `fillValidBook()` |
| `Cannot read properties of null` in a test | The test looks for a field or button that is not in the template yet |
| Library service: port 8080 in use | Another service is running on 8080. Stop it |
| CORS still blocked after T4 | Service not restarted, the class is not under `com.example.library`, or the origin is `127.0.0.1` instead of `localhost` |
| The catalogue is empty | `data/books.csv` was not copied from the seed |
