DO $$
DECLARE
    -- Variables to hold the new IDs
    new_owner_id INT;
    new_rest_id INT;
    cat_pizza_id INT;
    cat_burger_id INT;
BEGIN
    -- 1. Create a new Owner (User) to avoid foreign key errors
    -- Uses a random email to ensure uniqueness every time you run it
    INSERT INTO "User"
    (email, password_hash, role, surname, name, address, geo_lat, geo_lng)
    VALUES
    ('test-owner-' || floor(random()*10000)::text || '@example.com',
     'hash123', -- Dummy hash
     'OWNER', 'Test', 'Owner', 'Test Address 1', 48.2, 16.3)
    RETURNING user_id INTO new_owner_id;

    -- 2. Create the Restaurant linked to the new Owner
    INSERT INTO "Restaurant"
    (owner_id, restaurant_name, description, address, min_order_value, delivery_radius, geo_lat, geo_lng, is_active, category, area_code, approved)
    VALUES
    (new_owner_id,
     'Auto-Generated Pizza Place ' || floor(random()*1000)::text,
     'Generated for testing purposes',
     'Teststreet 1, 1010 Vienna',
     10.00, 5.0, 48.2, 16.3, TRUE, 'Italian', '2222', TRUE)
    RETURNING restaurant_id INTO new_rest_id;

    -- 3. Add Opening Hours
    INSERT INTO "OpenHours" (restaurant_id, day, open_from, open_till)
    VALUES
    (new_rest_id, 'MONDAY', '09:00', '22:00'),
    (new_rest_id, 'TUESDAY', '09:00', '22:00'),
    (new_rest_id, 'FRIDAY', '10:00', '23:00');

    -- 4. Create Categories and capture their IDs
    INSERT INTO "Categories" (restaurant_id, category_name) VALUES (new_rest_id, 'Pizza') RETURNING category_id INTO cat_pizza_id;
    INSERT INTO "Categories" (restaurant_id, category_name) VALUES (new_rest_id, 'Burgers') RETURNING category_id INTO cat_burger_id;

    -- 5. Add Dishes linked to the specific categories
    -- Note: using dummy hex '\x1234' for bytea images
    INSERT INTO "Dish"
    (restaurant_id, category_id, name, description, price, dish_bytea, avaliable)
    VALUES
    (new_rest_id, cat_pizza_id, 'Test Pizza Salami', 'Spicy', 12.50, '\x89504E47', TRUE),
    (new_rest_id, cat_pizza_id, 'Test Pizza Funghi', 'Mushrooms', 11.00, '\x89504E47', TRUE),
    (new_rest_id, cat_burger_id, 'Test Cheeseburger', 'Cheddar cheese', 9.50, '\x89504E47', TRUE);

    -- 6. Output the ID so you know which URL to call
    RAISE NOTICE 'Done! Created Restaurant ID: %', new_rest_id;
END $$;