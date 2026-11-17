import { defineConfig } from '@playwright/test';

// End to end: needs ng serve on 4200 AND the Library service
// on 8080. Nothing here is a stand-in.
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4200',
  },
});
