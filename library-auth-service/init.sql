-- Runs once, the first time the container starts with an
-- empty data directory. Reset with: docker compose down -v

CREATE TABLE links (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(40) NOT NULL UNIQUE,
  url        TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- rosa and sam are seeded by the auth service on start-up,
-- so their bcrypt hashes are made by real code, not pasted.
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(40) NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  roles         TEXT[]      NOT NULL DEFAULT '{READER}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
