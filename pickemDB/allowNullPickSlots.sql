-- Allows partial event picks by permitting NULL in predicted slot columns.
ALTER TABLE Picks ALTER COLUMN predicted_winner_id DROP NOT NULL;
ALTER TABLE Picks ALTER COLUMN predicted_second_id DROP NOT NULL;
ALTER TABLE Picks ALTER COLUMN predicted_third_id DROP NOT NULL;
ALTER TABLE Picks ALTER COLUMN predicted_fourth_id DROP NOT NULL;
