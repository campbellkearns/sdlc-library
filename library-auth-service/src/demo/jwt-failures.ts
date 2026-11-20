// NEW (not covered in class): this whole file.
// DEMO ONLY. Three ways a token fails verification.
// Run with: npm run demo:jwt
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../jwt-secret";

function attempt(
  label: string,
  token: string,
  secret = JWT_SECRET,
) {
  try {
    console.log(`${label}: OK`, jwt.verify(token, secret));
  } catch (err) {
    const e = err as Error;
    console.log(`${label}: ${e.name}: ${e.message}`);
  }
}

const token = jwt.sign(
  { sub: "sam", roles: ["READER"] },
  JWT_SECRET,
  { algorithm: "HS256", expiresIn: "15m" },
);
const [header, payload, signature] = token.split(".");

const claims = JSON.parse(
  Buffer.from(payload, "base64url").toString(),
);
console.log("Anyone can read the payload, no secret needed:");
console.log(claims, "\n");

const forged = Buffer.from(
  JSON.stringify({ ...claims, roles: ["LIBRARIAN"] }),
).toString("base64url");

const expired = jwt.sign(
  { sub: "sam", exp: Math.floor(Date.now() / 1000) - 10 },
  JWT_SECRET,
);

const tampered = `${header}.${forged}.${signature}`;
const otherSecret = "some-other-secret-key-32-bytes!!";

attempt("1. untouched   ", token);
attempt("2. roles edited", tampered);
attempt("3. wrong secret", token, otherSecret);
attempt("4. expired     ", expired);
