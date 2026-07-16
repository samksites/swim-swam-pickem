-- Drop tables in reverse dependency order

DROP TABLE IF EXISTS Swimmers;
DROP TABLE IF EXISTS CompetitionEvent;
DROP TABLE IF EXISTS CompetitionDays;
DROP TABLE IF EXISTS Competitions;

-- Competitions table (main competition info)
CREATE TABLE Competitions (
    comp_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entries_open TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'current', 'completed')),
    starts_on TIMESTAMP NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'W', 'B')),
    meet_type VARCHAR(3) NOT NULL CHECK (meet_type IN ('SCY', 'SCM', 'LCM'))
);

-- Competition Days (each competition can have multiple days)
CREATE TABLE CompetitionDays (
    day_id SERIAL PRIMARY KEY,
    comp_id INT NOT NULL,
    day_title VARCHAR(50) NOT NULL,
    day_order INT NOT NULL,
    FOREIGN KEY (comp_id) REFERENCES Competitions(comp_id) ON DELETE CASCADE,
    UNIQUE(comp_id, day_title)
);

-- Events table (each day has multiple events)
CREATE TABLE CompetitionEvent (
    event_id SERIAL PRIMARY KEY,
    day_id INT NOT NULL,
    event_title VARCHAR(100) NOT NULL,
    event_order INT NOT NULL,
    FOREIGN KEY (day_id) REFERENCES CompetitionDays(day_id) ON DELETE CASCADE
);

CREATE TABLE Swimmers (
    swimmer_id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    swimmer_name VARCHAR(100) NOT NULL,
    swimmer_time VARCHAR(20),
    place_finish INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES CompetitionEvent(event_id) ON DELETE CASCADE
);
