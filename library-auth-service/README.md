# library-auth-service

The Library's sign-in service, built in class on Thursday. It will
replace `library-auth-stub` with the same contract. `src/` is empty:
you build it with the instructor.

## Before class

You need Node and Docker (Docker Desktop running).

```bash
cd library-auth-service
docker compose up -d     # Postgres on port 5433
npm install              # bcrypt is a native package
```

Check Postgres: `docker compose ps` shows `healthy`.

Already running from Wednesday? `docker ps` shows `leap-w6-postgres`
as healthy: you are done, skip `docker compose up`. If compose says
the name `leap-w6-postgres` is already in use, run
`docker rm -f leap-w6-postgres` and then `docker compose up -d`.

## During class

```bash
npm run dev              # build with tsc, then start on port 3000
npm test                 # Jest
```

Stop `library-auth-stub` first: both use port 3000.

Behind? See "Catch up to the end of the demo" in
[`docs/lab-auth-service.md`](../docs/lab-auth-service.md).
