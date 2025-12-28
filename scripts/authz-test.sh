#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-https://app-a.local}"
PASS="${PASS:-ChangeMe123!}"

TMPDIR="$(mktemp -d)"
ADMIN_JAR="$TMPDIR/admin.txt"
USER_JAR="$TMPDIR/user.txt"

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

req_code() {
  jar="$1"; method="$2"; path="$3"; data="${4:-}"
  if [ -n "$data" ]; then
    curl -sk -o /dev/null -w "%{http_code}" -b "$jar" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$path"
  else
    curl -sk -o /dev/null -w "%{http_code}" -b "$jar" -X "$method" \
      "$BASE_URL$path"
  fi
}

login() {
  jar="$1"; username="$2"
  # cookie jar write
  curl -sk -c "$jar" -H "Content-Type: application/json" \
    -d "{\"username\":\"$username\",\"password\":\"$PASS\"}" \
    "$BASE_URL/auth/login" > /dev/null
}

expect() {
  name="$1"; got="$2"; want="$3"
  if [ "$got" != "$want" ]; then
    echo "FAIL: $name (got=$got want=$want)"
    return 1
  fi
  echo "OK:   $name ($got)"
  return 0
}

FAILS=0

echo "== AuthZ Test Suite =="
echo "Base: $BASE_URL"
echo

# Guest jar (empty cookie jar)
: > "$TMPDIR/guest.txt"
GUEST_JAR="$TMPDIR/guest.txt"

echo "-- Login sessions --"
login "$ADMIN_JAR" "admin"
login "$USER_JAR" "user1"
echo "OK: sessions acquired"
echo

# Matrix tests
echo "-- Matrix --"

# Public endpoints
c=$(req_code "$GUEST_JAR" GET "/health");   expect "guest GET /health" "$c" "200" || FAILS=$((FAILS+1))
c=$(req_code "$GUEST_JAR" GET "/");        expect "guest GET /" "$c" "200" || FAILS=$((FAILS+1))

# Auth endpoints behavior
c=$(req_code "$GUEST_JAR" GET "/me");       expect "guest GET /me" "$c" "401" || FAILS=$((FAILS+1))
c=$(req_code "$USER_JAR"  GET "/me");       expect "user  GET /me" "$c" "200" || FAILS=$((FAILS+1))
c=$(req_code "$ADMIN_JAR" GET "/me");       expect "admin GET /me" "$c" "200" || FAILS=$((FAILS+1))

# Admin endpoints
c=$(req_code "$GUEST_JAR" GET "/admin/users"); expect "guest GET /admin/users" "$c" "401" || FAILS=$((FAILS+1))
c=$(req_code "$USER_JAR"  GET "/admin/users"); expect "user  GET /admin/users" "$c" "403" || FAILS=$((FAILS+1))
c=$(req_code "$ADMIN_JAR" GET "/admin/users"); expect "admin GET /admin/users" "$c" "200" || FAILS=$((FAILS+1))

# Admin role update (pick id=5 as example)
PATCH_BODY='{"role":"manager"}'
c=$(req_code "$USER_JAR"  PATCH "/admin/users/5/role" "$PATCH_BODY"); expect "user  PATCH /admin/users/5/role" "$c" "403" || FAILS=$((FAILS+1))
c=$(req_code "$ADMIN_JAR" PATCH "/admin/users/5/role" "$PATCH_BODY"); expect "admin PATCH /admin/users/5/role" "$c" "200" || FAILS=$((FAILS+1))

echo
if [ "$FAILS" -gt 0 ]; then
  echo "== RESULT: FAIL ($FAILS failing checks) =="
  exit 1
fi
echo "== RESULT: PASS =="
