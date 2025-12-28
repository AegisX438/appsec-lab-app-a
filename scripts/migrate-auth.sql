ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS failed_login_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lock_until TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL;

CREATE TABLE IF NOT EXISTS session (
  sid varchar NOT NULL PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);
