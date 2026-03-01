-- Migration 002: Create user_profiles table
-- Stores personal info + AI-analyzed physical attributes
-- age is included here (integer, validated 0-120)

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id          UUID         PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(100),
  age              SMALLINT     CHECK (age >= 0 AND age <= 120),
  gender_identity  VARCHAR(50),
  pronouns         VARCHAR(30),

  -- AI-detected physical attributes (from selfie analysis)
  skin_tone_hex    VARCHAR(7),   -- e.g. '#C68642'
  fitzpatrick_scale VARCHAR(5),  -- I, II, III, IV, V, VI
  body_type        VARCHAR(50),
  face_shape       VARCHAR(50),
  hair_color       VARCHAR(50),
  hair_length      VARCHAR(30),

  -- Style preferences (stored as JSON arrays)
  -- Example: ["Casual", "Streetwear", "Minimalist"]
  style_prefs      JSONB         NOT NULL DEFAULT '[]',
  occasions        JSONB         NOT NULL DEFAULT '[]',

  -- Shopping budget
  budget_min       NUMERIC(8,2)  DEFAULT 0,
  budget_max       NUMERIC(8,2)  DEFAULT 500,

  -- Selfie image URL (stored in Cloudinary)
  selfie_url       TEXT,

  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Auto-update the updated_at timestamp whenever a row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
