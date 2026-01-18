-- Drop tables in reverse dependency order

DROP TABLE IF EXISTS SwimmerEntries;
DROP TABLE IF EXISTS CompetitionEvents;
DROP TABLE IF EXISTS CompetitionDays;
DROP TABLE IF EXISTS Competitions;

-- Competitions table (main competition info)
CREATE TABLE Competitions (
    comp_id SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_opens TIMESTAMP, -- When events open for picks
    status INTEGER DEFAULT -1 CHECK (status IN (-1, 0, 1)),
    starts_on TIMESTAMP,
    gender CHAR(1) DEFAULT 'B' CHECK (gender IN ('M', 'W', 'B')),
    seedTimes BOOLEAN DEFAULT TRUE,
    meet_type VARCHAR(3) DEFAULT 'SCY' CHECK (meet_type IN ('SCY', 'SCM', 'LCM')),
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(30)
);
-- Competition Days (each competition can have multiple days)
CREATE TABLE CompetitionDays (
    day_id SERIAL PRIMARY KEY,
    comp_id INT NOT NULL,
    day_order INT NOT NULL, -- e.g., 0 for Day 1, 1 for Day 2, etc.
    day_name VARCHAR(50) NOT NULL, -- e.g., "Day 1", "Preliminaries", "Finals"
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comp_id) REFERENCES Competitions(comp_id) ON DELETE CASCADE,
    UNIQUE(comp_id, day_name)
);
-- Events table (each day has multiple events)
CREATE TABLE CompetitionEvents (
    event_id SERIAL PRIMARY KEY,
    day_id INT NOT NULL,
    event_name VARCHAR(100) NOT NULL, -- e.g., "Men's 100m Freestyle"
    event_day_order INT NOT NULL, -- e.g., 1 for first event of the day, etc.
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_id, event_name),
    FOREIGN KEY (day_id) REFERENCES CompetitionDays(day_id) ON DELETE CASCADE
);

CREATE TABLE SwimmerEntries (
    swimmer_id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    swimmer_name VARCHAR(100) NOT NULL,
    place_finish INT, -- 1 for first place, 2 for second, etc.
    swimmer_time NUMERIC, -- e.g., "48.23"
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES CompetitionEvents(event_id) ON DELETE CASCADE
);
