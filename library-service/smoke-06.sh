#!/usr/bin/env bash
# Module 6 checks. Start the app first: mvn spring-boot:run
BASE=${BASE:-http://localhost:8080}
H='Content-Type: application/json'
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
say() { printf '\n== %s\n' "$1"; }

say "Bad request: blank title, blank author, year -5   (expect 400)"
code -X POST "$BASE/api/books" -H "$H" -d '{"title":"","author":"","year":-5}'; echo

say "Valid request   (expect 201)"
code -X POST "$BASE/api/books" -H "$H" -d '{"title":"Dune","author":"Frank Herbert","year":1965}'; echo

say "Same book again   (expect 409)"
code -X POST "$BASE/api/books" -H "$H" -d '{"title":"Dune","author":"Frank Herbert","year":1965}'; echo

say "Same title and author, different year   (expect 201)"
code -X POST "$BASE/api/books" -H "$H" -d '{"title":"Dune","author":"Frank Herbert","year":1966}'; echo

say "Not a UUID in the URL   (expect 400, before any of our rules)"
code "$BASE/api/books/not-a-uuid"; echo

say "Unknown but valid UUID   (expect 404)"
code "$BASE/api/books/00000000-0000-0000-0000-000000000000"; echo

say "Body of the 400 (note: no field named; that is Module 10's job)"
curl -s -X POST "$BASE/api/books" -H "$H" -d '{"title":"","author":"","year":-5}'; echo
