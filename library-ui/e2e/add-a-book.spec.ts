import { expect, test } from '@playwright/test';

// LIB-2, AC6: a saved book is still there after a reload.
// A real browser, the real app, the real Library service.
test('a saved book survives a reload', async ({ page }) => {
  // A new title each run, so the next run is not a 409.
  const title = `Test book ${Date.now()}`;

  // LIB-4: only a librarian reaches the form. Sign in, then
  // CLICK to the form: page.goto() loads the app again, and
  // the token (kept in memory) is gone.
  await page.goto('/login');
  await page.fill('#username', 'rosa');
  await page.fill('#password', 'librarian123');
  await page.click('button[type=submit]');
  await page.click('nav >> text=Add a book');

  await page.fill('#title', title);
  await page.fill('#author', 'Playwright');
  await page.fill('#year', '2026');
  await page.click('button[type=submit]');
  await expect(page.locator('.result')).toContainText(title);

  await page.click('text=Catalogue');
  await expect(page.locator('.book-list')).toContainText(title);

  // Reloading signs rosa out; the catalogue is open to all.
  await page.reload();

  await expect(page.locator('.book-list')).toContainText(title);
});
