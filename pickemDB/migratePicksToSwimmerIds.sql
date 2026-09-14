BEGIN;

-- 1) Add new swimmer-id pick columns.
ALTER TABLE Picks ADD COLUMN IF NOT EXISTS predicted_winner_id INT;
ALTER TABLE Picks ADD COLUMN IF NOT EXISTS predicted_second_id INT;
ALTER TABLE Picks ADD COLUMN IF NOT EXISTS predicted_third_id INT;
ALTER TABLE Picks ADD COLUMN IF NOT EXISTS predicted_fourth_id INT;

-- 2) Backfill IDs from existing swimmer-name picks.
UPDATE Picks p
SET
  predicted_winner_id = w.swimmer_id,
  predicted_second_id = s.swimmer_id,
  predicted_third_id = t.swimmer_id,
  predicted_fourth_id = f.swimmer_id
FROM Swimmers w
JOIN Swimmers s ON s.event_id = p.event_id AND s.swimmer_name = p.predicted_second
JOIN Swimmers t ON t.event_id = p.event_id AND t.swimmer_name = p.predicted_third
JOIN Swimmers f ON f.event_id = p.event_id AND f.swimmer_name = p.predicted_fourth
WHERE w.event_id = p.event_id
  AND w.swimmer_name = p.predicted_winner
  AND (p.predicted_winner_id IS NULL
    OR p.predicted_second_id IS NULL
    OR p.predicted_third_id IS NULL
    OR p.predicted_fourth_id IS NULL);

-- 3) Fail fast if any row could not be mapped.
DO $$
DECLARE
  missing_count INT;
BEGIN
  SELECT COUNT(*)
  INTO missing_count
  FROM Picks
  WHERE predicted_winner_id IS NULL
    OR predicted_second_id IS NULL
    OR predicted_third_id IS NULL
    OR predicted_fourth_id IS NULL;

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Migration aborted: % pick rows could not be mapped to swimmer_id values.', missing_count;
  END IF;
END $$;

-- 4) Add referential integrity and keep IDs nullable for partial saves.
ALTER TABLE Picks
  ADD CONSTRAINT picks_predicted_winner_id_fkey FOREIGN KEY (predicted_winner_id) REFERENCES Swimmers(swimmer_id);
ALTER TABLE Picks
  ADD CONSTRAINT picks_predicted_second_id_fkey FOREIGN KEY (predicted_second_id) REFERENCES Swimmers(swimmer_id);
ALTER TABLE Picks
  ADD CONSTRAINT picks_predicted_third_id_fkey FOREIGN KEY (predicted_third_id) REFERENCES Swimmers(swimmer_id);
ALTER TABLE Picks
  ADD CONSTRAINT picks_predicted_fourth_id_fkey FOREIGN KEY (predicted_fourth_id) REFERENCES Swimmers(swimmer_id);

ALTER TABLE Picks ALTER COLUMN predicted_winner_id DROP NOT NULL;
ALTER TABLE Picks ALTER COLUMN predicted_second_id DROP NOT NULL;
ALTER TABLE Picks ALTER COLUMN predicted_third_id DROP NOT NULL;
ALTER TABLE Picks ALTER COLUMN predicted_fourth_id DROP NOT NULL;

-- 5) Remove old name-based columns.
ALTER TABLE Picks DROP COLUMN predicted_winner;
ALTER TABLE Picks DROP COLUMN predicted_second;
ALTER TABLE Picks DROP COLUMN predicted_third;
ALTER TABLE Picks DROP COLUMN predicted_fourth;

COMMIT;
