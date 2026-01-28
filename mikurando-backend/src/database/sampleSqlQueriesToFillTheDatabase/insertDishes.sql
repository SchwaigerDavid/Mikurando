-- Insert dishes for Restaurant ID 3, 4, and 5
-- Dish table structure: dish_id, restaurant_id, name, description, price, dish_bytea, avaliable, category_id

-- First, create some categories for the restaurants
INSERT INTO "Categories" (restaurant_id, category_name) VALUES
(3, 'Vorspeisen'),
(3, 'Hauptgerichte'),
(3, 'Desserts'),
(3, 'Getränke'),
(4, 'Vorspeisen'),
(4, 'Hauptgerichte'),
(4, 'Beilagen'),
(4, 'Desserts'),
(5, 'Pizza'),
(5, 'Pasta'),
(5, 'Salate'),
(5, 'Desserts');

-- Dishes for Restaurant 3
INSERT INTO "Dish" (restaurant_id, name, description, price, avaliable, category_id) VALUES
-- Vorspeisen
(3, 'Bruschetta', 'Geröstetes Brot mit Tomaten, Basilikum und Knoblauch', 6.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Vorspeisen' LIMIT 1)),
(3, 'Caprese Salat', 'Tomaten mit Mozzarella und Basilikum', 8.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Vorspeisen' LIMIT 1)),
(3, 'Gemischter Salat', 'Frischer Salat mit Hausdressing', 5.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Vorspeisen' LIMIT 1)),

-- Hauptgerichte
(3, 'Spaghetti Carbonara', 'Klassische Pasta mit Speck, Ei und Parmesan', 12.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Hauptgerichte' LIMIT 1)),
(3, 'Pizza Margherita', 'Tomatensauce, Mozzarella und Basilikum', 9.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Hauptgerichte' LIMIT 1)),
(3, 'Lasagne Bolognese', 'Hausgemachte Lasagne mit Fleischsauce', 13.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Hauptgerichte' LIMIT 1)),
(3, 'Risotto ai Funghi', 'Cremiges Risotto mit Pilzen', 14.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Hauptgerichte' LIMIT 1)),

-- Desserts
(3, 'Tiramisu', 'Klassisches italienisches Dessert', 6.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Desserts' LIMIT 1)),
(3, 'Panna Cotta', 'Italienische Creme mit Beerensauce', 5.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Desserts' LIMIT 1)),

-- Getränke
(3, 'Coca Cola 0.33l', 'Erfrischungsgetränk', 2.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Getränke' LIMIT 1)),
(3, 'Mineralwasser 0.5l', 'Stilles oder Sprudel', 2.00, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 3 AND category_name = 'Getränke' LIMIT 1));

-- Dishes for Restaurant 4
INSERT INTO "Dish" (restaurant_id, name, description, price, avaliable, category_id) VALUES
-- Vorspeisen
(4, 'Edamame', 'Gedämpfte Sojabohnen mit Meersalz', 4.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Vorspeisen' LIMIT 1)),
(4, 'Gyoza', 'Japanische Teigtaschen mit Gemüsefüllung', 6.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Vorspeisen' LIMIT 1)),
(4, 'Miso Suppe', 'Traditionelle japanische Suppe', 3.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Vorspeisen' LIMIT 1)),

-- Hauptgerichte
(4, 'Ramen Tonkotsu', 'Nudelsuppe mit Schweinefleisch', 13.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Hauptgerichte' LIMIT 1)),
(4, 'Sushi Set (12 Stück)', 'Gemischte Sushi-Auswahl', 16.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Hauptgerichte' LIMIT 1)),
(4, 'Chicken Teriyaki', 'Gegrilltes Hähnchen mit Teriyaki-Sauce', 14.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Hauptgerichte' LIMIT 1)),
(4, 'Vegetarisches Curry', 'Japanisches Curry mit Gemüse', 11.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Hauptgerichte' LIMIT 1)),
(4, 'Katsu Curry', 'Paniertes Schnitzel mit Curry-Sauce', 13.50, false, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Hauptgerichte' LIMIT 1)),

-- Beilagen
(4, 'Reis', 'Gedämpfter Reis', 2.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Beilagen' LIMIT 1)),
(4, 'Kimchi', 'Fermentiertes Gemüse', 3.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Beilagen' LIMIT 1)),

-- Desserts
(4, 'Mochi', 'Süße Reiskuchen (3 Stück)', 5.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Desserts' LIMIT 1)),
(4, 'Matcha Eis', 'Grüntee-Eis', 4.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 4 AND category_name = 'Desserts' LIMIT 1));

-- Dishes for Restaurant 5
INSERT INTO "Dish" (restaurant_id, name, description, price, avaliable, category_id) VALUES
-- Pizza
(5, 'Pizza Salami', 'Tomatensauce, Mozzarella und Salami', 10.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Pizza' LIMIT 1)),
(5, 'Pizza Hawaii', 'Tomatensauce, Mozzarella, Schinken und Ananas', 11.00, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Pizza' LIMIT 1)),
(5, 'Pizza Quattro Formaggi', 'Vier verschiedene Käsesorten', 12.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Pizza' LIMIT 1)),
(5, 'Pizza Diavolo', 'Scharf mit Peperoni und Salami', 11.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Pizza' LIMIT 1)),
(5, 'Pizza Vegetaria', 'Mit frischem Gemüse', 10.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Pizza' LIMIT 1)),

-- Pasta
(5, 'Spaghetti Bolognese', 'Mit Hackfleischsauce', 11.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Pasta' LIMIT 1)),
(5, 'Penne Arrabiata', 'Scharfe Tomatensauce', 10.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Pasta' LIMIT 1)),
(5, 'Tagliatelle Alfredo', 'Sahnesauce mit Parmesan', 12.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Pasta' LIMIT 1)),
(5, 'Tortellini alla Panna', 'Tortellini in Sahnesauce', 13.50, false, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Pasta' LIMIT 1)),

-- Salate
(5, 'Caesar Salad', 'Römersalat mit Caesar-Dressing', 8.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Salate' LIMIT 1)),
(5, 'Insalata Mista', 'Gemischter Salat', 6.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Salate' LIMIT 1)),

-- Desserts
(5, 'Tartufo', 'Italienisches Eis-Dessert', 5.90, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Desserts' LIMIT 1)),
(5, 'Gelato (2 Kugeln)', 'Hausgemachtes Eis', 4.50, true, (SELECT category_id FROM "Categories" WHERE restaurant_id = 5 AND category_name = 'Desserts' LIMIT 1));
