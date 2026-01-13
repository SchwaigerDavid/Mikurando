DO $$
DECLARE
    target_restaurant_id INT := 1; -- Hier ID anpassen, falls nicht 1
    new_user_id INT;
    target_dish_id INT;
BEGIN
    -- Wir holen uns irgendeine Dish-ID von diesem Restaurant (für spezifische Gericht-Reviews)
    SELECT dish_id INTO target_dish_id FROM "Dish" WHERE restaurant_id = target_restaurant_id LIMIT 1;

    -- Review 1: Super zufrieden (Allgemein)
    INSERT INTO "User" (email, password_hash, role, surname, name, address, geo_lat, geo_lng)
    VALUES ('reviewer1_' || floor(random()*10000) || '@test.com', 'hash', 'CUSTOMER', 'Müller', 'Hans', 'Wien', 0, 0) RETURNING user_id INTO new_user_id;

    INSERT INTO "Reviews" (restaurant_id, user_id, dish_id, rating, comment, created_at)
    VALUES (target_restaurant_id, new_user_id, NULL, 5, 'Absolut fantastisch! Die Lieferung war blitzschnell.', NOW() - INTERVAL '2 days');

    -- Review 2: Geht so (Verbunden mit einem Gericht, falls vorhanden)
    INSERT INTO "User" (email, password_hash, role, surname, name, address, geo_lat, geo_lng)
    VALUES ('reviewer2_' || floor(random()*10000) || '@test.com', 'hash', 'CUSTOMER', 'Schmidt', 'Lisa', 'Graz', 0, 0) RETURNING user_id INTO new_user_id;

    INSERT INTO "Reviews" (restaurant_id, user_id, dish_id, rating, comment, created_at)
    VALUES (target_restaurant_id, new_user_id, target_dish_id, 3, 'Essen war okay, aber leider etwas kalt angekommen.', NOW() - INTERVAL '5 days');

    -- Review 3: Schlecht (Allgemein)
    INSERT INTO "User" (email, password_hash, role, surname, name, address, geo_lat, geo_lng)
    VALUES ('reviewer3_' || floor(random()*10000) || '@test.com', 'hash', 'CUSTOMER', 'Gruber', 'Max', 'Linz', 0, 0) RETURNING user_id INTO new_user_id;

    INSERT INTO "Reviews" (restaurant_id, user_id, dish_id, rating, comment, created_at)
    VALUES (target_restaurant_id, new_user_id, NULL, 1, 'Nie wieder! Fahrer war unhöflich und Pizza verbrannt.', NOW() - INTERVAL '10 days');

    -- Review 4: Sehr gut (Mit Gericht)
    INSERT INTO "User" (email, password_hash, role, surname, name, address, geo_lat, geo_lng)
    VALUES ('reviewer4_' || floor(random()*10000) || '@test.com', 'hash', 'CUSTOMER', 'Wagner', 'Sarah', 'Wien', 0, 0) RETURNING user_id INTO new_user_id;

    INSERT INTO "Reviews" (restaurant_id, user_id, dish_id, rating, comment, created_at)
    VALUES (target_restaurant_id, new_user_id, target_dish_id, 5, 'Beste Pasta, die ich je bestellt habe. Gerne wieder!', NOW() - INTERVAL '12 hours');

    -- Review 5: Gut (Allgemein)
    INSERT INTO "User" (email, password_hash, role, surname, name, address, geo_lat, geo_lng)
    VALUES ('reviewer5_' || floor(random()*10000) || '@test.com', 'hash', 'CUSTOMER', 'Hofer', 'Franz', 'Salzburg', 0, 0) RETURNING user_id INTO new_user_id;

    INSERT INTO "Reviews" (restaurant_id, user_id, dish_id, rating, comment, created_at)
    VALUES (target_restaurant_id, new_user_id, NULL, 4, 'Solide Leistung, Preis-Leistung stimmt.', NOW() - INTERVAL '1 week');

    RAISE NOTICE '5 Reviews für Restaurant ID % erfolgreich eingefügt.', target_restaurant_id;
END $$;