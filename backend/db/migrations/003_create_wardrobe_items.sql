-- Migration 003: Create wardrobe_items table

CREATE TYPE item_category AS ENUM (
  'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'
);

CREATE TYPE item_condition AS ENUM (
  'New', 'Good', 'Worn', 'Needs Cleaning'
);

CREATE TABLE IF NOT EXISTS wardrobe_items (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- AI-detected metadata
  category        item_category,
  subcategory     VARCHAR(50),
  color_primary   VARCHAR(7),    -- hex e.g. '#3A5FCD'
  color_secondary JSONB          NOT NULL DEFAULT '[]', -- array of hex strings
  pattern         VARCHAR(50),
  formality_score SMALLINT       CHECK (formality_score BETWEEN 1 AND 5),
  season          JSONB          NOT NULL DEFAULT '[]', -- ['Spring','Summer'] etc.
  material        VARCHAR(60),
  ai_tags         JSONB          NOT NULL DEFAULT '{}', -- full AI analysis result

  -- User-editable metadata
  custom_name     VARCHAR(100),
  brand           VARCHAR(80),
  purchase_price  NUMERIC(8,2),
  condition       item_condition DEFAULT 'Good',

  -- Image
  image_url       TEXT          NOT NULL,
  cloudinary_id   TEXT,          -- needed to delete from Cloudinary later

  -- Tracking
  last_worn       DATE,
  wear_count      INTEGER        NOT NULL DEFAULT 0,
  is_deleted      BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wardrobe_user ON wardrobe_items (user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_user_cat ON wardrobe_items (user_id, category);
CREATE INDEX IF NOT EXISTS idx_wardrobe_last_worn ON wardrobe_items (user_id, last_worn);
