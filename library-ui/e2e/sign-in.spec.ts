import { expect, Page, test } from '@playwright/test';

// LIB-4 in a real browser. Needs ng serve (4200), the auth
// stub (3000) and the Library service (8080).

async function signIn(
  page: Page,
  username: string,
  password: string,
) {
  await page.goto('/login');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type=submit]');
}

test('signed out, Add a book goes to sign in (S1)', async ({
  page,
}) => {
  await page.goto('/books/new');

  await expect(page).toHaveURL(/\/login$/);
});

test('a wrong password is refused (S3)', async ({ page }) => {
  await signIn(page, 'rosa', 'wrong');

  await expect(page.locator('.error')).toContainText(
    'Invalid username or password.',
  );
  const header = page.locator('header');
  await expect(header).not.toContainText('Signed in');
});

test('a librarian signs in and out (S2, S6)', async ({
  page,
}) => {
  await signIn(page, 'rosa', 'librarian123');

  const nav = page.locator('nav');
  await expect(page.locator('header')).toContainText(
    'Signed in as rosa (LIBRARIAN)',
  );
  await page.click('nav >> text=Add a book');
  await expect(page).toHaveURL(/\/books\/new$/);

  await page.click('text=Sign out');

  await expect(nav).not.toContainText('Add a book');
  await expect(nav).toContainText('Sign in');
});

test('a reader sees no Add a book (S5)', async ({ page }) => {
  await signIn(page, 'sam', 'reader123');

  await expect(page.locator('header')).toContainText(
    'Signed in as sam (READER)',
  );
  await expect(page.locator('nav')).not.toContainText(
    'Add a book',
  );
});
