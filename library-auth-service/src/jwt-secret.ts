// Must match the Library service's secret exactly (HS256).
export const JWT_SECRET =
  process.env.JWT_SECRET ??
  "library-shared-secret-key-32-bytes-minimum";

// NEW (not covered in class): used by the warning in main.ts.
export const USING_FALLBACK_SECRET = !process.env.JWT_SECRET;
