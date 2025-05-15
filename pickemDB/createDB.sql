DROP TABLE IF EXISTS Picks;
DROP TABLE IF EXISTS UserCompetitions;
DROP TABLE IF EXISTS Competition;
DROP TABLE IF EXISTS swimSwam_user;

CREATE TABLE swimSwam_user (
    user_id INT PRIMARY KEY,
    public_user_id SERIAL UNIQUE NOT NULL, -- Added UNIQUE constraint
    username VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE Competition (
    comp_id INT PRIMARY KEY,
    event_name VARCHAR(50) NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    starts_on TIMESTAMP,
    ends_on TIMESTAMP,
    meet_type VARCHAR(50),
    swim_events TEXT[], 
    event_swimmer_names TEXT[], 
    results TEXT[] 
);


CREATE TABLE UserCompetitions (
    user_competition_id SERIAL PRIMARY KEY,
    public_user_id INT NOT NULL,
    comp_id INT NOT NULL,
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (public_user_id) REFERENCES swimSwam_user(public_user_id),
    FOREIGN KEY (comp_id) REFERENCES Competition(comp_id)
);

CREATE TABLE Picks (
    picks_id SERIAL PRIMARY KEY,
    user_competition_id INT NOT NULL,
    last_edit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picks TEXT[] NOT NULL, 
    score INT DEFAULT 0,
    FOREIGN KEY (user_competition_id) REFERENCES UserCompetitions(user_competition_id)
);

