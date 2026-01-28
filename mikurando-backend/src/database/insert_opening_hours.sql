-- Insert Opening Hours für Restaurant 3 und 4 (Montag - Freitag, 0:00 - 23:00 Uhr)

INSERT INTO opening_hours (restaurant_id, day_week_day, open_from, open_till) VALUES
-- Restaurant 3
(3, 'MONDAY', '00:00:00', '23:00:00'),
(3, 'TUESDAY', '00:00:00', '23:00:00'),
(3, 'WEDNESDAY', '00:00:00', '23:00:00'),
(3, 'THURSDAY', '00:00:00', '23:00:00'),
(3, 'FRIDAY', '00:00:00', '23:00:00'),
-- Restaurant 4
(4, 'MONDAY', '00:00:00', '23:00:00'),
(4, 'TUESDAY', '00:00:00', '23:00:00'),
(4, 'WEDNESDAY', '00:00:00', '23:00:00'),
(4, 'THURSDAY', '00:00:00', '23:00:00'),
(4, 'FRIDAY', '00:00:00', '23:00:00');