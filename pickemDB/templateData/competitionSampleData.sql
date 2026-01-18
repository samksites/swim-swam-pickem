-- Sample Data for the Swim Competition Database
-- This demonstrates how to populate the database with realistic data

-- Insert sample users
INSERT INTO swimSwam_user (public_user_id, username, email, admin) VALUES
(1001, 'swimmer_fan_1', 'fan1@example.com', false),
(1002, 'pool_expert', 'expert@example.com', false),
(1003, 'admin_user', 'admin@swimswam.com', true);

-- Insert a sample competition
INSERT INTO Competitions (event_name) VALUES
(''),
('');
-- Insert competition days
INSERT INTO CompetitionDays (comp_id, day_name) VALUES
(1, 'Day 1 - Preliminaries'),
(1, 'Day 1 - Finals'),
(1, 'Day 2 - Preliminaries'),
(1, 'Day 2 - Finals'),
(1, 'Day 3 - Finals');

-- Insert sample events
INSERT INTO CompetitionEvent (day_id, event_name) VALUES
-- Day 1 Finals (day_id = 2)
(2, 'Women 500 Freestyle'),
(2, 'Men 200 Individual Medley'),
(2, 'Women 50 Freestyle'),
(2, 'Men 50 Freestyle'),
-- Day 2 Finals (day_id = 4)
(4, 'Women 100 Butterfly'),
(4, 'Men 100 Backstroke'),
-- Day 3 Finals (day_id = 5)
(5, 'Women 200 Freestyle'),
(5, 'Men 100 Breaststroke');

-- Insert swimmers for Women 500 Freestyle (event_id = 1)
INSERT INTO Swimmers (event_id, swimmer_name, place_finish, swimmer_time) VALUES
(1, 'Katie Ledecky', 1, '4:56.32'),
(1, 'Emma Weyant', 2, '4:59.18'),
(1, 'Paige Madden', 3, '5:01.45'),
(1, 'Bella Sims', 4, '5:02.12'),
(1, 'Kensey McMahon', 5, '5:03.78');

-- Insert swimmers for Men 200 Individual Medley (event_id = 2)
INSERT INTO Swimmers (event_id, swimmer_name, place_finish, swimmer_time) VALUES
(2, 'Bobby Finke', 1, '1:50.25'),
(2, 'Carson Foster', 2, '1:51.34'),
(2, 'Hugo Gonzalez', 3, '1:52.15'),
(2, 'Shaine Casas', 4, '1:52.67');

-- Insert swimmers for Women 50 Freestyle (event_id = 3)
INSERT INTO Swimmers (event_id, swimmer_name, place_finish, swimmer_time) VALUES
(3, 'Gretchen Walsh', 1, '20.37'),
(3, 'Kate Douglass', 2, '20.84'),
(3, 'Torri Huske', 3, '21.02'),
(3, 'Abbey Weitzeil', 4, '21.15');

-- Insert swimmers for Men 50 Freestyle (event_id = 4)
INSERT INTO Swimmers (event_id, swimmer_name, place_finish, swimmer_time) VALUES
(4, 'Caeleb Dressel', 1, '18.90'),
(4, 'Ryan Held', 2, '19.15'),
(4, 'Nathan Adrian', 3, '19.32'),
(4, 'Michael Chadwick', 4, '19.45');

-- Insert swimmers for Women 100 Butterfly (event_id = 5)
INSERT INTO Swimmers (event_id, swimmer_name, place_finish, swimmer_time) VALUES
(5, 'Torri Huske', 1, '55.52'),
(5, 'Gretchen Walsh', 2, '55.89'),
(5, 'Regan Smith', 3, '56.12'),
(5, 'Kate Douglass', 4, '56.45');

-- Insert swimmers for Men 100 Backstroke (event_id = 6)
INSERT INTO Swimmers (event_id, swimmer_name, place_finish, swimmer_time) VALUES
(6, 'Ryan Murphy', 1, '51.85'),
(6, 'Hunter Armstrong', 2, '52.12'),
(6, 'Shaine Casas', 3, '52.34'),
(6, 'Austin Katz', 4, '52.67');

-- Insert swimmers for Women 200 Freestyle (event_id = 7)
INSERT INTO Swimmers (event_id, swimmer_name, place_finish, swimmer_time) VALUES
(7, 'Katie Ledecky', 1, '1:52.85'),
(7, 'Paige Madden', 2, '1:53.21'),
(7, 'Claire Weinstein', 3, '1:53.78'),
(7, 'Erin Gemmell', 4, '1:54.12');

-- Insert swimmers for Men 100 Breaststroke (event_id = 8)
INSERT INTO Swimmers (event_id, swimmer_name, place_finish, swimmer_time) VALUES
(8, 'Nic Fink', 1, '58.12'),
(8, 'Josh Matheny', 2, '58.45'),
(8, 'Charlie Swanson', 3, '58.89'),
(8, 'Matt Fallon', 4, '59.12');

-- Insert user competition entries
INSERT INTO UserCompetitions (public_user_id, comp_id) VALUES
(1001, 1),
(1002, 1);

-- Insert sample picks with all four positions
INSERT INTO Picks (user_competition_id, event_id, predicted_winner, predicted_second, predicted_third, predicted_fourth) VALUES
-- User 1001's picks for Women 500 Freestyle
(1, 1, 'Katie Ledecky', 'Emma Weyant', 'Paige Madden', 'Bella Sims'),
-- User 1001's picks for Men 200 Individual Medley  
(1, 2, 'Carson Foster', 'Bobby Finke', 'Hugo Gonzalez', 'Shaine Casas'),
-- User 1001's picks for Women 50 Freestyle
(1, 3, 'Gretchen Walsh', 'Kate Douglass', 'Torri Huske', 'Abbey Weitzeil'),
-- User 1001's picks for Men 50 Freestyle
(1, 4, 'Caeleb Dressel', 'Ryan Held', 'Nathan Adrian', 'Michael Chadwick'),
-- User 1002's picks for Women 500 Freestyle
(2, 1, 'Emma Weyant', 'Katie Ledecky', 'Bella Sims', 'Paige Madden'),
-- User 1002's picks for Men 200 Individual Medley
(2, 2, 'Bobby Finke', 'Carson Foster', 'Hugo Gonzalez', 'Shaine Casas'),
-- User 1002's picks for Women 50 Freestyle
(2, 3, 'Kate Douglass', 'Gretchen Walsh', 'Abbey Weitzeil', 'Torri Huske'),
-- User 1002's picks for Men 50 Freestyle
(2, 4, 'Ryan Held', 'Caeleb Dressel', 'Michael Chadwick', 'Nathan Adrian');

-- Note: Picks table doesn't have points_earned column in current schema
-- Total scores would need to be calculated based on pick accuracy
-- For now, setting some sample scores manually
UPDATE UserCompetitions SET total_score = 25 WHERE user_competition_id = 1;
UPDATE UserCompetitions SET total_score = 30 WHERE user_competition_id = 2;
