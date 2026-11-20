# library-auth-service (after the labs)

The Library's sign-in service: NestJS 11, Postgres (`pg`), bcrypt,
HS256 JWT. It replaces `library-auth-stub` with the same contract.

## Run it

```bash
docker compose up -d     # Postgres on 5433 (skip if it is running)
npm install              # bcrypt is a native package
npm run dev              # build with tsc, then start on port 3000
npm test                 # Jest, no database needed
```

Stop `library-auth-stub` first: both use port 3000.

## The contract (same as the stub)

- `POST /auth/login` with `{ username, password }` answers
  `{ accessToken, refreshToken }`; wrong credentials: 401.
- `POST /auth/register` makes a READER: 201, or 409 if taken.
- Port 3000; CORS for `http://localhost:4200`.
- rosa (`librarian123`, LIBRARIAN) and sam (`reader123`, READER)
  are created at start-up.
- Token: HS256, 15 minutes, claims `sub` and `roles`, signed with
  `JWT_SECRET` (default `library-shared-secret-key-32-bytes-minimum`,
  with a warning).

OpenAPI docs: http://localhost:3000/api

## Demos

```bash
npm run demo:injection   # string-built SQL vs a $1 placeholder
npm run demo:jwt         # a token edited, wrong secret, expired
```

## Added by the labs

- `GET /auth/me`: who does this token name? 401 unless it is good.
- `GET /auth/users`: librarians only. 401 with no token, 403 for a
  reader. Never returns password hashes.
