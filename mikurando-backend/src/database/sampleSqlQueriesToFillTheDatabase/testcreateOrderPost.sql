DO $$
    DECLARE
        new_owner_id INT;
        new_rest_id INT;
        cat_main_id INT;
        -- Helper to make email unique
        random_suffix TEXT := floor(random()*10000)::text;
    BEGIN
        -- 1. Create Owner
        INSERT INTO "User"
        (email, password_hash, role, surname, name, address, geo_lat, geo_lng)
        VALUES
            ('rest-owner-' || random_suffix || '@test.com', 'hash123', 'OWNER', 'Bob', 'Burger', 'Vienna', 48.2, 16.3)
        RETURNING user_id INTO new_owner_id;

        -- 2. Create Restaurant
        -- Min Order: 10€, Radius: 20km (large enough for testing)
        INSERT INTO "Restaurant"
        (owner_id, restaurant_name, description, address, min_order_value, delivery_radius, geo_lat, geo_lng, is_active, category, area_code, approved)
        VALUES
            (new_owner_id, 'Bob''s Burgers ' || random_suffix, 'Best burgers in town', 'Mariahilfer Straße 1, Vienna', 10.00, 20.0, 48.2082, 16.3738, TRUE, 'American', 1234, true)
        RETURNING restaurant_id INTO new_rest_id;

        -- 3. Add Opening Hours (Standard)
        INSERT INTO "OpenHours" (restaurant_id, day, open_from, open_till)
        VALUES (new_rest_id, 'MONDAY', '08:00', '23:00');

        -- 4. Create Category
        INSERT INTO "Categories" (restaurant_id, category_name)
        VALUES (new_rest_id, 'Mains')
        RETURNING category_id INTO cat_main_id;

        -- 5. Create Dishes
        -- Dish 1: Available (ID will be generated)
        INSERT INTO "Dish" (restaurant_id, category_id, name, description, price, avaliable, dish_bytea)
        VALUES (new_rest_id, cat_main_id, 'Classic Cheeseburger', 'Beef, Cheddar, Lettuce', 12.50, TRUE, '\x1234');

        -- Dish 2: Available
        INSERT INTO "Dish" (restaurant_id, category_id, name, description, price, avaliable, dish_bytea)
        VALUES (new_rest_id, cat_main_id, 'Chili Cheese Fries', 'Spicy and cheesy', 5.50, TRUE, '\x1234');

        -- Dish 3: NOT AVAILABLE (For testing error handling)
        INSERT INTO "Dish" (restaurant_id, category_id, name, description, price, avaliable, dish_bytea)
        VALUES (new_rest_id, cat_main_id, 'Lobster Special', 'Fresh from the ocean', 45.00, FALSE, '\x1234');

        -- 6. Create Voucher
        -- Check if TEST5 exists to avoid duplicate key error, otherwise insert
        IF NOT EXISTS (SELECT 1 FROM "Voucher" WHERE code = 'TEST5') THEN
            INSERT INTO "Voucher" (code, voucher_value, voucher_value_is_percentage, valid_until)
            VALUES ('TEST5', 5.00, FALSE, '2030-01-01 00:00:00');
        END IF;

        -- 7. Output IDs for you to use in Postman
        RAISE NOTICE '------------------------------------------------';
        RAISE NOTICE 'CREATED DATA FOR TESTING:';
        RAISE NOTICE 'Restaurant ID: %', new_rest_id;
        RAISE NOTICE 'Voucher Code: TEST5';
        RAISE NOTICE 'Check the DB table "Dish" to see the new Dish IDs for Restaurant %', new_rest_id;
        RAISE NOTICE '------------------------------------------------';
    END $$;