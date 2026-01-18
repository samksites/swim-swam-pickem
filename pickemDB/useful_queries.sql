-- Useful Queries for the Swim Competition Database

-- 1. Get all competitions with their basic stats
SELECT * FROM CompetitionOverview;

-- 2. Get all events for a specific competition with their swimmer counts
SELECT * FROM EventsWithSwimmers WHERE comp_id = 1;

-- 3. Get the leaderboard for a specific competition
SELECT * FROM UserLeaderboard WHERE comp_id = 1;

-- 4. Get detailed results for a specific event
SELECT 
    c.event_name as competition,
    cd.day_name,
    e.event_name,
    s.place_finish,
    s.swimmer_name,
    s.time_result
FROM Swimmers s
JOIN Events e ON s.event_id = e.event_id
JOIN CompetitionDays cd ON e.day_id = cd.day_id
JOIN Competitions c ON cd.comp_id = c.comp_id
WHERE e.event_id = 1
ORDER BY s.place_finish;

-- 5. Get a user's picks vs actual results for a competition
SELECT 
    u.username,
    e.event_name,
    cd.day_name,
    p.predicted_winner,
    p.predicted_second,
    p.predicted_third,
    p.predicted_fourth,
    s1.swimmer_name as actual_winner,
    s2.swimmer_name as actual_second,
    s3.swimmer_name as actual_third,
    s4.swimmer_name as actual_fourth,
    p.points_earned
FROM Picks p
JOIN UserCompetitions uc ON p.user_competition_id = uc.user_competition_id
JOIN swimSwam_user u ON uc.public_user_id = u.public_user_id
JOIN Events e ON p.event_id = e.event_id
JOIN CompetitionDays cd ON e.day_id = cd.day_id
LEFT JOIN Swimmers s1 ON e.event_id = s1.event_id AND s1.place_finish = 1
LEFT JOIN Swimmers s2 ON e.event_id = s2.event_id AND s2.place_finish = 2
LEFT JOIN Swimmers s3 ON e.event_id = s3.event_id AND s3.place_finish = 3
LEFT JOIN Swimmers s4 ON e.event_id = s4.event_id AND s4.place_finish = 4
WHERE uc.comp_id = 1 AND u.public_user_id = 1001
ORDER BY e.event_id;

-- 6. Get upcoming events that users can still make picks for
SELECT 
    c.comp_id,
    c.event_name as competition,
    cd.day_name,
    e.event_id,
    e.event_name,
    CASE 
        WHEN CURRENT_TIMESTAMP < c.events_open THEN 'Not Open Yet'
        WHEN c.status = 'completed' THEN 'Closed'
        ELSE 'Open for Picks'
    END as pick_status
FROM Events e
JOIN CompetitionDays cd ON e.day_id = cd.day_id
JOIN Competitions c ON cd.comp_id = c.comp_id
WHERE c.status IN ('upcoming', 'active')
ORDER BY c.starts_on, e.event_id;

-- 7. Get statistics for each event (how many users picked each swimmer as winner)
SELECT 
    e.event_name,
    p.predicted_winner,
    COUNT(*) as pick_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Picks p2 WHERE p2.event_id = e.event_id), 2) as pick_percentage
FROM Picks p
JOIN Events e ON p.event_id = e.event_id
WHERE e.event_id = 1
GROUP BY e.event_name, p.predicted_winner
ORDER BY pick_count DESC;

-- 8. Get events by day with swimmer counts
SELECT 
    c.event_name as competition,
    cd.day_name,
    e.event_name,
    COUNT(s.result_id) as swimmer_count
FROM Competitions c
JOIN CompetitionDays cd ON c.comp_id = cd.comp_id
JOIN Events e ON cd.day_id = e.day_id
LEFT JOIN Swimmers s ON e.event_id = s.event_id
WHERE c.comp_id = 1
GROUP BY c.event_name, cd.day_name, e.event_name, cd.day_id, e.event_id
ORDER BY cd.day_id, e.event_id;

-- 9. Get pick accuracy analysis by position
SELECT 
    e.event_name,
    COUNT(*) as total_picks,
    SUM(CASE WHEN p.predicted_winner = s1.swimmer_name THEN 1 ELSE 0 END) as correct_winner_picks,
    SUM(CASE WHEN p.predicted_second = s2.swimmer_name THEN 1 ELSE 0 END) as correct_second_picks,
    SUM(CASE WHEN p.predicted_third = s3.swimmer_name THEN 1 ELSE 0 END) as correct_third_picks,
    SUM(CASE WHEN p.predicted_fourth = s4.swimmer_name THEN 1 ELSE 0 END) as correct_fourth_picks,
    ROUND(AVG(p.points_earned), 2) as avg_points_per_pick
FROM Picks p
JOIN Events e ON p.event_id = e.event_id
LEFT JOIN Swimmers s1 ON e.event_id = s1.event_id AND s1.place_finish = 1
LEFT JOIN Swimmers s2 ON e.event_id = s2.event_id AND s2.place_finish = 2  
LEFT JOIN Swimmers s3 ON e.event_id = s3.event_id AND s3.place_finish = 3
LEFT JOIN Swimmers s4 ON e.event_id = s4.event_id AND s4.place_finish = 4
GROUP BY e.event_name, e.event_id
ORDER BY e.event_id;

-- 10. Get all swimmers in an event ordered by their finishing position
SELECT 
    e.event_name,
    s.place_finish,
    s.swimmer_name,
    s.time_result
FROM Events e
JOIN Swimmers s ON e.event_id = s.event_id
WHERE e.event_id = 1
ORDER BY s.place_finish;
