# library-auth-stub

A stand-in sign-in service for the Library, on port 3000. Two users:

| User | Password | Role |
|---|---|---|
| `rosa` | `librarian123` | LIBRARIAN |
| `sam` | `reader123` | READER |

```bash
npm install
node server.js
```

`POST /auth/login` with `{ "username", "password" }` answers `{ accessToken, refreshToken }`, or 401. This is the same contract as the auth service you build in Week 6, which will replace this stub.
