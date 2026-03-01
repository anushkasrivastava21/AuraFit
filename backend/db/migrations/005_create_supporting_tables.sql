-- Migration 005: Supporting tables for external features

CREATE TABLE IF NOT EXISTS rate_my_fit_logs (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  input_url           TEXT,
  compatibility_score INTEGER     CHECK (compatibility_score BETWEEN 0 AND 100),
  rating_score        NUMERIC(3,1) CHECK (rating_score BETWEEN 0 AND 10),
  ai_feedback         JSONB       NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_recs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name    VARCHAR(200),
  product_url     TEXT,
  image_url       TEXT,
  price           NUMERIC(8,2),
  currency        VARCHAR(5)  DEFAULT 'USD',
  reason_text     TEXT,
  category        VARCHAR(50),
  was_clicked     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gemini_usage (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        REFERENCES users(id) ON DELETE SET NULL,
  endpoint        VARCHAR(80) NOT NULL,   -- e.g. 'selfie-analysis'
  model           VARCHAR(60) NOT NULL,   -- e.g. 'gemini-1.5-flash'
  prompt_tokens   INTEGER     NOT NULL DEFAULT 0,
  response_tokens INTEGER     NOT NULL DEFAULT 0,
  success         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
