DROP TABLE IF EXISTS signed_in_user;

CREATE TABLE signed_in_user (
    session_id VARCHAR(255) PRIMARY KEY,
    last_login TIMESTAMP NOT NULL,
    last_active TIMESTAMP NOT NULL,
    username VARCHAR(30) NOT NULL,
    FOREIGN KEY (username) REFERENCES swimswam_user(username) ON UPDATE CASCADE ON DELETE CASCADE
);
