# Lab: The Library Auth Service

In class we built `library-auth-service`: people can register, log in, and get a signed token, and the Library's sign-in page now talks to it instead of the stub. But so far the only thing that reads a token is the Library UI. You finish the job: two routes that **read** a token and decide what its holder may do.

Work **test first**, as before: red, green, refactor.

## Where to start

- **You followed the demo:** carry on in your own repo.
- **You fell behind in the demo:** use "Catch up to the end of the demo" at the bottom.
- **Postgres is not running:** `cd library-auth-service`, then `docker compose up -d`. If Docker says the name `leap-w6-postgres` is in use, run `docker rm -f leap-w6-postgres` first, then `up -d` again.

**Three terminals** in `library-auth-service`:

```bash
docker compose ps          # Postgres: should say healthy
npm run dev                # the service, on port 3000
npm test -- --watch        # Jest, re-runs on every save
```

Stop `library-auth-stub` first: both use port 3000. You can sign in as `rosa` (`librarian123`, LIBRARIAN) or `sam` (`reader123`, READER), or anyone you registered.

## The story

From BR-08: *only librarians should be able to change the catalogue; readers can only look.* For that, a service must be able to tell **who is calling** and **what they may do** from the token alone.

> **LIB-5.** As the **head librarian**, I want **the auth service to tell who a token belongs to, and to show the user list only to librarians**, so that **the Library can trust what a token says**.

### Acceptance criteria

**Lab 1, who am I?** `GET /auth/me`

- **W1.** No `Authorization` header: **401**.
- **W2.** A header that is not `Bearer <token>`: **401**.
- **W3.** A token signed with a different secret, or expired: **401**.
- **W4.** A good token: **200** with `{ username, roles }`, read from the token.

**Lab 2, librarians only.** `GET /auth/users`

- **R1.** No token: **401**.
- **R2.** A reader's token (sam): **403**.
- **R3.** A librarian's token (rosa): **200** with a list of `{ username, roles }`. **Never password hashes.**

---

## Lab 1. Who am I? (about 15 min)

1. **Tests first.** Create `src/auth/auth.me.spec.ts` with these tests: W1, W2, W3 twice (another secret, and an expired token), and W4. Each calls `service.verify(...)`, which does not exist yet, so they are all red.

<details>
<summary>Hint: the set-up, and the first test</summary>

The set-up is the same as the login spec:

```ts
describe("AuthService.verify", () => {
  const repo = { findByUsername: jest.fn(), insert: jest.fn() };
  let service: AuthService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: repo },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });
```

`verify` is not `async`, so a refusal is a plain throw:

```ts
  it("refuses a request with no header (W1)", () => {
    expect(() => service.verify(undefined)).toThrow(
      UnauthorizedException,
    );
  });
```

For W3, make the bad tokens with `jwt.sign`: another secret, or a past expiry (`exp: 1` means 1970).

```ts
const forged = jwt.sign({ sub: "rosa" }, "other-secret");
const expired = jwt.sign(
  { sub: "rosa", roles: ["LIBRARIAN"], exp: 1 },
  JWT_SECRET,
);
```

For W4, log in first (mock `findByUsername` to return rosa, as the login spec does), then pass `` `Bearer ${accessToken}` `` to `verify`.

</details>

2. **Green.** Add `verify(authorization?: string)` to `AuthService`. It returns `{ username, roles }`, or throws `UnauthorizedException`.

<details>
<summary>Hint: the shape</summary>

```ts
verify(authorization?: string): Identity {
  // 1. no header, or it does not start with "Bearer "  -> 401
  // 2. take the text after "Bearer "
  // 3. jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] })
  //    wrapped in try/catch: any failure -> 401
  // 4. return { username: claims.sub, roles: claims.roles }
}
```

`jwt.verify` already throws for a wrong secret, an edited token and an expired one. You only have to turn those into a 401.

</details>

3. **The route.** In `auth.controller.ts`, add `@Get("me")`. Read the header with `@Headers("authorization")` and call `verify`.
4. **Prove it.** Log in, keep the token, and try all four:

```bash
TOKEN=$(curl -s -X POST localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"rosa","password":"librarian123"}' \
  | node -pe \
  'JSON.parse(require("fs").readFileSync(0)).accessToken')
H="Authorization: Bearer"

curl -s -i localhost:3000/auth/me
curl -s -i localhost:3000/auth/me -H "$H nonsense"
curl -s localhost:3000/auth/me -H "$H $TOKEN"
```

You should see 401, 401, then `{"username":"rosa","roles":["LIBRARIAN"]}`.

**Think about it:** why pass `{ algorithms: ["HS256"] }` to `jwt.verify`? What could a caller try if you did not?

---

## Lab 2. Librarians only (about 15 min)

1. **Tests first.** Create `src/auth/auth.users.spec.ts` with three tests, R1 to R3. Mock the repository's `findAll`. For R2 and R3, make a token with `jwt.sign({ sub, roles }, JWT_SECRET, { expiresIn: "15m" })` instead of logging in.

   In R2, also check that `findAll` was **not called**. A reader must not even cause the query.

<details>
<summary>Hint: the 403 test</summary>

```ts
it("answers 403 for a reader (R2)", async () => {
  const sam = `Bearer ${tokenFor("sam", ["READER"])}`;

  await expect(service.listUsers(sam)).rejects.toBeInstanceOf(
    ForbiddenException,
  );
  expect(repo.findAll).not.toHaveBeenCalled();
});
```

`ForbiddenException` is the 403, and it is a different class from `UnauthorizedException`, the 401.

</details>

2. **Green.** Two steps:
   - In `users.repository.ts`, add `findAll()`. It selects **only** `username` and `roles`, never `password_hash`, ordered by `id`.
   - In `AuthService`, add `listUsers(authorization?: string)`. It calls your `verify` first (so a missing or bad token is already a 401), then throws `ForbiddenException` unless the roles include `LIBRARIAN`, then returns `findAll()`.
3. **The route.** `@Get("users")` in the controller, the same shape as `me`.
4. **Prove it.** With rosa's `$TOKEN` from Lab 1, and a second token for sam:

```bash
curl -s -i localhost:3000/auth/users
curl -s localhost:3000/auth/users -H "$H $TOKEN"
```

   Then log in as `sam` and try `/auth/users` with his token. You should see 401, then rosa's list (`rosa` and `sam`, plus anyone you registered), then 403 for sam.

**Think about it:**

- **401 and 403 are different answers.** What does each one tell the caller? Which one means "I do not know who you are"?
- Why does `findAll` select only two columns, when the table has three?
- You wrote the role check inside the service. Nest has a name for a check that runs *before* the route and can be reused on many routes: a **guard**. Last week's Angular guard did the same job. What would be better about moving this check into one?

---

## At the end

`rosa` and `sam` get different answers from the same URL, because of what their tokens say. The Library service will have to make the same two decisions on its own: no token **401**, sam **403**, rosa **201**. Your `verify` is the shape of that check.

Commit your work. If you want to compare with the instructor's answer, fetch the branch `lab-auth-done`.

---

## Catch up to the end of the demo

If you fell behind, bring your `library-auth-service` folder to the end of the demo. **This overwrites the files that are on that branch**, so commit or stash anything you want to keep first.

```bash
git fetch
git checkout origin/auth-demo-done -- library-auth-service
cd library-auth-service
npm install
```

Then check it:

```bash
docker compose ps          # healthy?
npm test                   # the login specs pass
npm run dev                # service starts on port 3000
curl -s -X POST localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"rosa","password":"librarian123"}'
```

You should get an `accessToken` and a `refreshToken`. Then start Lab 1.

**Nothing on `auth-demo-done`?** Ask. The instructor has not pushed it yet, or your `git fetch` could not reach `origin`.

## If something is red

| What you see | Likely cause |
|---|---|
| `EADDRINUSE :3000` | The stub or an old service is still running. Stop it. |
| `ECONNREFUSED 127.0.0.1:5433` | Postgres is not up. `docker compose up -d`. |
| Rosa gets 401 at login | The seed runs at start-up. Restart `npm run dev`. |
| A test says `service.verify is not a function` | Good: that is the red. Now write `verify`. |
| `Cannot find module 'bcrypt'` or a build error | `npm install` did not finish. `npm rebuild bcrypt`. |
