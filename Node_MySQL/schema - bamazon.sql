DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products (
	item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    PRIMARY KEY (item_id)
);

CREATE TABLE cart (
	customer_id INT NOT NULL AUTO_INCREMENT,
    total_due DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (customer_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("piano", "instruments", 500.00, 10), ("coffee maker", "appliances", 75.00, 10),
    ("rummikub", "toys/games", 19.99, 10), ("pet carrier", "miscellaneous", 25.00, 10),
    ("Aladdin", "movies", 24.00, 10), ("bicycle", "sporting equipment", 75.00, 10),
    ("helmet", "sporting equipment", 15.00, 10), ("bottle opener", "kitchenware", 4.99, 10),
    ("flute", "instruments", 80.00, 10), ("checkers", "toys/games", 9.99, 10);

SELECT * FROM bamazon.products;

