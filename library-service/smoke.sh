#!/usr/bin/env bash
# Runs the five CRUD steps against a running Library (default http://localhost:8080).
# Usage: ./smoke.sh            (start the app first: mvn spring-boot:run)
BASE=${BASE:-http://localhost:8080}
H='Content-Type: application/json'
say() { printf '\n== %s\n' "$1"; }

say "1. Create (expect 201 and a generated id)"
RESP=$(curl -s -i -X POST "$BASE/api/books" -H "$H" -d '{"title":"Dune","author":"Frank Herbert","year":1965}')
echo "$RESP" | head -1
ID=$(echo "$RESP" | tr -d '\r' | sed -nE 's/.*"id":"([^"]+)".*/\1/p' | head -1)
echo "id = $ID"

say "2. List (expect 200, Dune in the array)"
curl -s "$BASE/api/books"; echo

say "3. Get one (expect 200)"
curl -s -o /dev/null -w '%{http_code}\n' "$BASE/api/books/$ID"

say "4. Update (expect 200, year 1966)"
curl -s -X PUT "$BASE/api/books/$ID" -H "$H" -d '{"title":"Dune","author":"Frank Herbert","year":1966}'; echo

say "5. Delete (expect 204), then GET again (expect 404)"
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE "$BASE/api/books/$ID"
curl -s -o /dev/null -w '%{http_code}\n' "$BASE/api/books/$ID"
