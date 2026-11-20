// DEMO ONLY. Shows what the $1 placeholders prevent.
// Run with: npm run demo:injection
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://leap:leap@127.0.0.1:5433/leap_w6",
});

type Row = { username: string; password_hash: string };

function show(rows: Row[]) {
  for (const r of rows) {
    const hash = r.password_hash.slice(0, 20);
    console.log(`  ${r.username.padEnd(8)} ${hash}...`);
  }
  if (rows.length === 0) console.log("  (no rows)");
}

async function findUnsafe(username: string) {
  const sql = `SELECT username, password_hash FROM users
     WHERE username = '${username}'`;
  console.log("Executing:", sql.replace(/\s+/g, " "));
  show((await pool.query<Row>(sql)).rows);
}

async function findSafe(username: string) {
  const sql = `SELECT username, password_hash FROM users
     WHERE username = $1`;
  console.log("Executing:", sql.replace(/\s+/g, " "));
  console.log("      with:", [username]);
  show((await pool.query<Row>(sql, [username])).rows);
}

async function main() {
  const attack = "x' OR '1'='1";

  console.log("\n1. A normal lookup, SQL built from a string");
  await findUnsafe("tess");

  console.log("\n2. The attack, SQL built from a string");
  await findUnsafe(attack);

  console.log("\n3. The same attack, with a $1 placeholder");
  await findSafe(attack);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
