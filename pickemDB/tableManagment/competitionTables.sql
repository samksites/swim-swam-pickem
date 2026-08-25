-- Schema used by the current competition service payload.
-- The service persists normalized competition data with:
-- title, entries_open, status, starts_on, gender, meet_type,
-- CompetitionDays(day_title, day_order), CompetitionEvent(event_title, event_order),
-- and Swimmers(swimmer_time as text).

DROP TABLE IF EXISTS Picks;
DROP TABLE IF EXISTS Swimmers;
DROP TABLE IF EXISTS CompetitionEvent;
DROP TABLE IF EXISTS CompetitionDays;
DROP TABLE IF EXISTS UserCompetitions;
DROP TABLE IF EXISTS Competitions;
DROP TABLE IF EXISTS swimswam_user;

CREATE TABLE swimswam_user (
    user_id SERIAL PRIMARY KEY,
    public_user_id INT UNIQUE NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE Competitions (
    comp_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entries_open TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'upcoming', 'open', 'current', 'completed')),
    starts_on TIMESTAMP NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'W', 'B')),
    meet_type VARCHAR(3) NOT NULL CHECK (meet_type IN ('SCY', 'SCM', 'LCM'))
);

CREATE TABLE CompetitionDays (
    day_id SERIAL PRIMARY KEY,
    comp_id INT NOT NULL,
    day_title VARCHAR(50) NOT NULL,
    day_order INT NOT NULL,
    FOREIGN KEY (comp_id) REFERENCES Competitions(comp_id) ON DELETE CASCADE,
    UNIQUE(comp_id, day_title)
);

CREATE TABLE CompetitionEvent (
    event_id SERIAL PRIMARY KEY,
    day_id INT NOT NULL,
    event_title VARCHAR(100) NOT NULL,
    event_order INT NOT NULL,
    FOREIGN KEY (day_id) REFERENCES CompetitionDays(day_id) ON DELETE CASCADE,
    UNIQUE(day_id, event_title)
);

CREATE TABLE Swimmers (
    swimmer_id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    swimmer_name VARCHAR(100) NOT NULL,
    swimmer_time VARCHAR(20),
    place_finish INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES CompetitionEvent(event_id) ON DELETE CASCADE,
    UNIQUE(event_id, swimmer_name)
);

CREATE TABLE UserCompetitions (
    user_competition_id SERIAL PRIMARY KEY,
    public_user_id INT NOT NULL,
    comp_id INT NOT NULL,
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_score INT DEFAULT 0,
    FOREIGN KEY (public_user_id) REFERENCES swimswam_user(public_user_id) ON DELETE CASCADE,
    FOREIGN KEY (comp_id) REFERENCES Competitions(comp_id) ON DELETE CASCADE,
    UNIQUE(public_user_id, comp_id)
);

CREATE TABLE Picks (
    pick_id SERIAL PRIMARY KEY,
    user_competition_id INT NOT NULL,
    event_id INT NOT NULL,
    predicted_winner VARCHAR(100) NOT NULL,
    predicted_second VARCHAR(100) NOT NULL,
    predicted_third VARCHAR(100) NOT NULL,
    predicted_fourth VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_competition_id) REFERENCES UserCompetitions(user_competition_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES CompetitionEvent(event_id) ON DELETE CASCADE,
    UNIQUE(user_competition_id, event_id)
);