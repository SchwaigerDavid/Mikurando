DO $$
    DECLARE
        target_rest_id INT := 5; -- The Restaurant ID
        new_user_id INT;
        new_order_id INT;
        new_dish_id INT;
        dish_price NUMERIC := 14.50;

        -- Category ID variable
        target_cat_id INT;
    BEGIN
        -- 0. Ensure Restaurant 5 exists (Create it if not, for safety)
        -- If it exists, we just grab its ID. If not, we insert it.
        IF NOT EXISTS (SELECT 1 FROM "Restaurant" WHERE restaurant_id = target_rest_id) THEN
            RAISE EXCEPTION 'Restaurant ID % does not exist in your DB. Please run the Create Restaurant script first or change the ID.', target_rest_id;
        END IF;

        -- 1. Get or Create a Category for Restaurant 5 (Required for Dish)
        SELECT category_id INTO target_cat_id FROM "Categories" WHERE restaurant_id = target_rest_id LIMIT 1;

        IF target_cat_id IS NULL THEN
            INSERT INTO "Categories" (restaurant_id, category_name) VALUES (target_rest_id, 'Test Menu') RETURNING category_id INTO target_cat_id;
        END IF;

        -- 2. Insert a new Dish into Restaurant 5
        INSERT INTO "Dish"
        (restaurant_id, category_id, name, description, price, avaliable, dish_bytea)
        VALUES
            (target_rest_id, target_cat_id, 'Auto-Inserted Pizza', 'Created by script', dish_price, TRUE, '\x1234')
        RETURNING dish_id INTO new_dish_id;

        -- 3. Create a User (Customer)
        INSERT INTO "User" (email, password_hash, role, surname, name, address, geo_lat, geo_lng)
        VALUES
            ('eater-' || floor(random()*10000) || '@test.com', 'hash', 'CUSTOMER', 'Tom', 'Tester', 'Vienna', 48.2, 16.3)
        RETURNING user_id INTO new_user_id;

        -- 4. Create the Order (Ordering 1x the new Pizza)
        INSERT INTO "Order"
        (user_id, restaurant_id, status, created_at, total_price, service_fee, delivery_address, delivery_lat, delivery_lng, estimated_delivery_time)
        VALUES
            (new_user_id, target_rest_id, 'PLACED', NOW(), dish_price + 2.50, 2.50, 'Vienna', 48.2, 16.3, NOW() + INTERVAL '30 minutes')
        RETURNING order_id INTO new_order_id;

        -- 5. Add Item to Order
        INSERT INTO "Ordered_Items" (order_id, dish_id, quantity, price)
        VALUES (new_order_id, new_dish_id, 1, dish_price);

        RAISE NOTICE 'Done! Added Dish ID % to Restaurant % and created Order ID %.', new_dish_id, target_rest_id, new_order_id;
    END $$;