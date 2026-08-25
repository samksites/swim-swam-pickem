-- Sample Data for the Swim Competition Database
-- This file matches the schema used by competition.service:
-- Competitions(title, entries_open, status, starts_on, gender, meet_type)
-- CompetitionDays(day_title, day_order)
-- CompetitionEvent(event_title, event_order)
-- Swimmers(swimmer_time stored as text)

INSERT INTO Competitions (
	title,
	entries_open,
	status,
	starts_on,
	gender,
	meet_type
) VALUES
('Summer Invitational', TIMESTAMP '2026-08-20 09:00:00', 'upcoming', TIMESTAMP '2026-08-23 08:00:00', 'B', 'SCY');

INSERT INTO CompetitionDays (comp_id, day_title, day_order) VALUES
(1, 'Day 1 - Preliminaries', 1),
(1, 'Day 1 - Finals', 2),
(1, 'Day 2 - Preliminaries', 3),
(1, 'Day 2 - Finals', 4),
(1, 'Day 3 - Finals', 5);

INSERT INTO CompetitionEvent (day_id, event_title, event_order) VALUES
(2, 'Women 500 Freestyle', 1),
(2, 'Men 200 Individual Medley', 2),
(2, 'Women 50 Freestyle', 3),
(2, 'Men 50 Freestyle', 4),
(4, 'Women 100 Butterfly', 1),
(4, 'Men 100 Backstroke', 2),
(5, 'Women 200 Freestyle', 1),
(5, 'Men 100 Breaststroke', 2);

INSERT INTO Swimmers (event_id, swimmer_name, place_finish, swimmer_time) VALUES
(1, 'Katie Ledecky', 1, '4:56.32'),
(1, 'Emma Weyant', 2, '4:59.18'),
(1, 'Paige Madden', 3, '5:01.45'),
(1, 'Bella Sims', 4, '5:02.12'),
(1, 'Kensey McMahon', 5, '5:03.78'),
(2, 'Bobby Finke', 1, '1:50.25'),
(2, 'Carson Foster', 2, '1:51.34'),
(2, 'Hugo Gonzalez', 3, '1:52.15'),
(2, 'Shaine Casas', 4, '1:52.67'),
(3, 'Gretchen Walsh', 1, '20.37'),
(3, 'Kate Douglass', 2, '20.84'),
(3, 'Torri Huske', 3, '21.02'),
(3, 'Abbey Weitzeil', 4, '21.15'),
(4, 'Caeleb Dressel', 1, '18.90'),
(4, 'Ryan Held', 2, '19.15'),
(4, 'Nathan Adrian', 3, '19.32'),
(4, 'Michael Chadwick', 4, '19.45'),
(5, 'Torri Huske', 1, '55.52'),
(5, 'Gretchen Walsh', 2, '55.89'),
(5, 'Regan Smith', 3, '56.12'),
(5, 'Kate Douglass', 4, '56.45'),
(6, 'Ryan Murphy', 1, '51.85'),
(6, 'Hunter Armstrong', 2, '52.12'),
(6, 'Shaine Casas', 3, '52.34'),
(6, 'Austin Katz', 4, '52.67'),
(7, 'Katie Ledecky', 1, '1:52.85'),
(7, 'Paige Madden', 2, '1:53.21'),
(7, 'Claire Weinstein', 3, '1:53.78'),
(7, 'Erin Gemmell', 4, '1:54.12'),
(8, 'Nic Fink', 1, '58.12'),
(8, 'Josh Matheny', 2, '58.45'),
(8, 'Charlie Swanson', 3, '58.89'),
(8, 'Matt Fallon', 4, '59.12');
