-- Migration 001: Create users table
-- The users table stores login credentials only
-- Personal info goes in user_profiles (next migration)

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- enables gen_random_uuid()

CREATE TABLE IF NOT EXISTS users (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  TEXT         NOT NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_active    TIMESTAMPTZ,
  is_deleted     BOOLEAN      NOT NULL DEFAULT FALSE
);

-- Index on email so login lookups are fast
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
