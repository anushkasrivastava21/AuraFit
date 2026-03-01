-- Migration 004: Create outfits and saved_outfits tables

CREATE TYPE generation_method AS ENUM ('prompt', 'pick', 'surprise');

CREATE TABLE IF NOT EXISTS outfits (
  id                UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Which wardrobe items make up this outfit
  item_ids          UUID[]            NOT NULL,  -- array of wardrobe_items.id

  -- How was it generated?
  generation_method generation_method NOT NULL,
  mood_tag          VARCHAR(60),       -- e.g. 'Date Night'

  -- User feedback
  rating            SMALLINT          CHECK (rating BETWEEN 1 AND 5),
  notes             TEXT,
  worn_date         DATE,

  created_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_outfits (
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outfit_id    UUID        NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  is_favourite BOOLEAN     NOT NULL DEFAULT FALSE,
  nickname     VARCHAR(80),
  saved_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, outfit_id)  -- can't save the same outfit twice
);

CREATE INDEX IF NOT EXISTS idx_outfits_user_date
  ON outfits (user_id, worn_date DESC);
CREATE INDEX IF NOT EXISTS idx_outfits_user_method
  ON outfits (user_id, generation_method);
