// Must match the Library service's secret exactly (HS256).
export const JWT_SECRET =
  process.env.JWT_SECRET ??
  "library-shared-secret-key-32-bytes-minimum";

export const USING_FALLBACK_SECRET = !process.env.JWT_SECRET;
