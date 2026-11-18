// For tests only: a token-shaped string,
// header.payload.signature. The browser reads only the middle
// part and never checks the signature (the service does), so
// the other two parts can be anything.
export function makeToken(claims: object): string {
  const payload = btoa(JSON.stringify(claims));
  return `header.${payload}.signature`;
}
