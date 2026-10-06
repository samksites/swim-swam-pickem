BEGIN;

ALTER TABLE Competitions
  ADD COLUMN IF NOT EXISTS picks_per_event SMALLINT NOT NULL DEFAULT 4;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'competitions_picks_per_event_check'
      AND conrelid = 'competitions'::regclass
  ) THEN
    ALTER TABLE Competitions
      ADD CONSTRAINT competitions_picks_per_event_check
      CHECK (picks_per_event BETWEEN 1 AND 4);
  END IF;
END $$;

COMMIT;