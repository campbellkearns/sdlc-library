// There is no parameter for a password or a token, so nothing
// secret can be passed through, even under deadline pressure.
export function logAuthEvent(event: string, username: string) {
  console.log(`[auth] ${event} username=${username}`);
}
