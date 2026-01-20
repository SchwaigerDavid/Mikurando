UPDATE "Restaurant"
SET geo_lat = 48.2082, geo_lng = 16.3738
WHERE geo_lat IS NULL OR geo_lng IS NULL;

-- 2. Repariere den User (Setze ihn 1km weit weg)
-- Damit die Distanzberechnung ca. 1-2 km ergibt
UPDATE "User"
SET geo_lat = 48.2150, geo_lng = 16.3800
WHERE geo_lat IS NULL OR geo_lng IS NULL;