-- Improved Database Schema for Swim Competition Pick'em
-- This design properly normalizes the hierarchical structure:
-- Competitions → Competition Days → Events → Event Results (Swimmers)

-- Drop tables in reverse dependency order
-- Drop tables in order of dependency (child tables first, parent tables last)
DROP TABLE IF EXISTS Picks;
DROP TABLE IF EXISTS Swimmers;
DROP TABLE IF EXISTS CompetitionEvent;
DROP TABLE IF EXISTS CompetitionDays;
DROP TABLE IF EXISTS UserCompetitions;
DROP TABLE IF EXISTS Competitions;
DROP TABLE IF EXISTS swimSwam_user;

-- Users table (unchanged from your original)
CREATE TABLE swimSwam_user (
    user_id SERIAL PRIMARY KEY,
    public_user_id INT UNIQUE NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin BOOLEAN DEFAULT FALSE
);

-- Competitions table (main competition info)
CREATE TABLE Competitions (
    comp_id SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    events_open TIMESTAMP NOT NULL, -- When events open for picks
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'current', 'completed')),
    starts_on TIMESTAMP NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'W', 'B')),
    meet_type VARCHAR(3) NOT NULL CHECK (meet_type IN ('SCY', 'SCM', 'LCM'))
);

-- Competition Days (each competition can have multiple days)
CREATE TABLE CompetitionDays (
    day_id SERIAL PRIMARY KEY,
    comp_id INT NOT NULL,
    day_name VARCHAR(50) NOT NULL, -- e.g., "Day 1", "Preliminaries", "Finals"
    FOREIGN KEY (comp_id) REFERENCES Competitions(comp_id) ON DELETE CASCADE,
    UNIQUE(comp_id, day_name)
);

-- Events table (each day has multiple events)
CREATE TABLE CompetitionEvent (
    event_id SERIAL PRIMARY KEY,
    day_id INT NOT NULL,
    event_name VARCHAR(100) NOT NULL, -- e.g., "Men's 100m Freestyle", "Women's 200m Butterfly"
    FOREIGN KEY (day_id) REFERENCES CompetitionDays(day_id) ON DELETE CASCADE,
    UNIQUE(event_id, event_name)
);

-- swimmers
CREATE TABLE Swimmers (
    swimmerId SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    swimmer_name VARCHAR(100) NOT NULL,
    swimmer_time VARCHAR(20),
    place_finish INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES CompetitionEvent(event_id) ON DELETE CASCADE,
    UNIQUE(swimmerId, swimmer_name) -- Each place can only have one swimmer per event
);

-- User Competitions (which competitions users are participating in)
CREATE TABLE UserCompetitions (
    user_competition_id SERIAL PRIMARY KEY,
    public_user_id INT NOT NULL,
    comp_id INT NOT NULL,
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_score INT DEFAULT 0,
    FOREIGN KEY (public_user_id) REFERENCES swimSwam_user(public_user_id) ON DELETE CASCADE,
    FOREIGN KEY (comp_id) REFERENCES Competitions(comp_id) ON DELETE CASCADE,
    UNIQUE(public_user_id, comp_id)
);

-- Picks table (user predictions for each event)
CREATE TABLE Picks (
    pick_id SERIAL PRIMARY KEY,
    user_competition_id INT NOT NULL,
    event_id INT NOT NULL,
    predicted_winner VARCHAR(100) NOT NULL, -- Name of swimmer predicted to win
    predicted_second VARCHAR(100) NOT NULL, -- Name of swimmer predicted to come second
    predicted_third VARCHAR(100) NOT NULL, -- Name of swimmer predicted to come third
    predicted_fourth VARCHAR(100) NOT NULL, -- Name of swimmer predicted to come fourth
    FOREIGN KEY (user_competition_id) REFERENCES UserCompetitions(user_competition_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES CompetitionEvent(event_id) ON DELETE CASCADE,
    UNIQUE(user_competition_id, event_id) -- One pick per user per event
);

-- Indexes for better performance
CREATE INDEX idx_competitions_starts_on ON Competitions(starts_on);
CREATE INDEX idx_competitions_events_open ON Competitions(events_open);
CREATE INDEX idx_competition_days_comp_id ON CompetitionDays(comp_id);
CREATE INDEX idx_competition_event_day_id ON CompetitionEvent(day_id);
CREATE INDEX idx_swimmers_event_id ON Swimmers(event_id);
CREATE INDEX idx_swimmers_place ON Swimmers(place_finish);
CREATE INDEX idx_user_competitions_user_id ON UserCompetitions(public_user_id);
CREATE INDEX idx_picks_user_competition_id ON Picks(user_competition_id);
CREATE INDEX idx_picks_event_id ON Picks(event_id);

-- Add some useful views for common queries
CREATE VIEW CompetitionOverview AS
SELECT 
    c.comp_id,
    c.event_name,
    c.starts_on,
    c.events_open,
    c.meet_type,
    COUNT(DISTINCT cd.day_id) as total_days,
    COUNT(DISTINCT e.event_id) as total_events,
    COUNT(DISTINCT uc.public_user_id) as total_participants
FROM Competitions c
LEFT JOIN CompetitionDays cd ON c.comp_id = cd.comp_id
LEFT JOIN CompetitionEvent e ON cd.day_id = e.day_id
LEFT JOIN UserCompetitions uc ON c.comp_id = uc.comp_id
GROUP BY c.comp_id, c.event_name, c.starts_on, c.events_open, c.meet_type;

CREATE VIEW EventsWithSwimmers AS
SELECT 
    c.comp_id,
    c.event_name as competition_name,
    cd.day_name,
    e.event_id,
    e.event_name,
    COUNT(s.swimmerId) as total_swimmers
FROM Competitions c
JOIN CompetitionDays cd ON c.comp_id = cd.comp_id
JOIN CompetitionEvent e ON cd.day_id = e.day_id
LEFT JOIN Swimmers s ON e.event_id = s.event_id
GROUP BY c.comp_id, c.event_name, cd.day_name, e.event_id, e.event_name
ORDER BY cd.day_id, e.event_id;

CREATE VIEW UserLeaderboard AS
SELECT 
    c.comp_id,
    c.event_name as competition_name,
    u.username,
    uc.total_score,
    COUNT(p.pick_id) as total_picks
FROM UserCompetitions uc
JOIN swimSwam_user u ON uc.public_user_id = u.public_user_id
JOIN Competitions c ON uc.comp_id = c.comp_id
LEFT JOIN Picks p ON uc.user_competition_id = p.user_competition_id
GROUP BY c.comp_id, c.event_name, u.username, uc.total_score
ORDER BY c.comp_id, uc.total_score DESC;
