import { defineConfig } from '@playwright/test';

// End to end: needs ng serve on 4200, the Library service on
// 8080 AND the auth stub on 3000. Nothing here is a stand-in.
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4200',
  },
});
