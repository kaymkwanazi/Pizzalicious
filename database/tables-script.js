const { Client } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
console.log("🚀 ~ databaseUrl:", databaseUrl)

if (!databaseUrl) {
    console.error('DATABASE_URL is not defined in the .env file.');
    process.exit(1);
}

const sqlCommands = `
-- Drop tables if they exist to avoid conflicts
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS OrderDetails;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS OrderStatuses;
DROP TABLE IF EXISTS UserRoles;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS DessertIngredients;
DROP TABLE IF EXISTS Desserts;
DROP TABLE IF EXISTS PizzaIngredients;
DROP TABLE IF EXISTS Pizzas;
DROP TABLE IF EXISTS Ingredients;
DROP TABLE IF EXISTS Refreshments;
DROP TABLE IF EXISTS PizzaBases;

-- Creating Pizzalicious database schema with UUID primary keys

-- Table for Pizza Bases
CREATE TABLE PizzaBases (
    BaseID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    BaseName VARCHAR(50) NOT NULL,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Ingredients
CREATE TABLE Ingredients (
    IngredientID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    IngredientName VARCHAR(50) NOT NULL,
    IsVegan BOOLEAN DEFAULT FALSE,
    IsGlutenFree BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Pizzas
CREATE TABLE Pizzas (
    PizzaID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    PizzaName VARCHAR(100) NOT NULL,
    BaseID UUID REFERENCES PizzaBases(BaseID),
    Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0),
    ImageURL VARCHAR(255),
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for Pizza Ingredients
CREATE TABLE PizzaIngredients (
    PizzaID UUID REFERENCES Pizzas(PizzaID),
    IngredientID UUID REFERENCES Ingredients(IngredientID),
    PRIMARY KEY (PizzaID, IngredientID),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Desserts
CREATE TABLE Desserts (
    DessertID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    DessertName VARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0),
    ImageURL VARCHAR(255),
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for Dessert Ingredients
CREATE TABLE DessertIngredients (
    DessertID UUID REFERENCES Desserts(DessertID),
    IngredientID UUID REFERENCES Ingredients(IngredientID),
    PRIMARY KEY (DessertID, IngredientID),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Refreshments
CREATE TABLE Refreshments (
    RefreshmentID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    RefreshmentName VARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0),
    ImageURL VARCHAR(255),
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Roles
CREATE TABLE Roles (
    RoleID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Users
CREATE TABLE Users (
    UserID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for User Roles
CREATE TABLE UserRoles (
    UserID UUID REFERENCES Users(UserID),
    RoleID UUID REFERENCES Roles(RoleID),
    PRIMARY KEY (UserID, RoleID),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Order Statuses
CREATE TABLE OrderStatuses (
    StatusID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    StatusName VARCHAR(50) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Orders
CREATE TABLE Orders (
    OrderID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserID UUID REFERENCES Users(UserID),
    StatusID UUID REFERENCES OrderStatuses(StatusID),
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10,2) NOT NULL CHECK (TotalAmount >= 0),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Order Details (Customer Info related to the order)
CREATE TABLE OrderDetails (
    OrderDetailID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    OrderID UUID REFERENCES Orders(OrderID),
    CustomerName VARCHAR(100) NOT NULL,
    CustomerAddress TEXT NOT NULL,
    CustomerPhone VARCHAR(20),
    CustomerEmail VARCHAR(100),
    DeliveryInstructions TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Order Items (to handle multiple items per order)
CREATE TABLE OrderItems (
    OrderItemID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    OrderID UUID REFERENCES Orders(OrderID),
    PizzaID UUID REFERENCES Pizzas(PizzaID) ON DELETE SET NULL,
    DessertID UUID REFERENCES Desserts(DessertID) ON DELETE SET NULL,
    RefreshmentID UUID REFERENCES Refreshments(RefreshmentID) ON DELETE SET NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL CHECK (UnitPrice >= 0),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for improved performance
CREATE INDEX idx_pizzas_baseid ON Pizzas(BaseID);
CREATE INDEX idx_orders_userid ON Orders(UserID);
CREATE INDEX idx_orders_statusid ON Orders(StatusID);
CREATE INDEX idx_orderdetails_orderid ON OrderDetails(OrderID);
CREATE INDEX idx_orderitems_orderid ON OrderItems(OrderID);

-- Insert test data (2 records per table)

-- Insert into PizzaBases (already provided)
INSERT INTO PizzaBases (BaseName, Description) VALUES
('Thin Crust', 'Crispy and light pizza base'),
('Thick Crust', 'Soft and chewy pizza base');

-- Insert into Ingredients (already provided)
INSERT INTO Ingredients (IngredientName, IsVegan, IsGlutenFree) VALUES
('Mozzarella Cheese', FALSE, TRUE),
('Tomato Sauce', TRUE, TRUE);

-- Insert into Pizzas (already provided)
INSERT INTO Pizzas (PizzaName, BaseID, Price, ImageURL, Description) VALUES
('Margherita', (SELECT BaseID FROM PizzaBases WHERE BaseName = 'Thin Crust'), 12.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkqQv_OWlwUjUtOVW2_FhN3qeyctB8VgekDg&s', 'Classic pizza with tomato and mozzarella'),
('Pepperoni', (SELECT BaseID FROM PizzaBases WHERE BaseName = 'Thick Crust'), 14.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2f38jmDq8OZhG72KpH345LC9teABsdTXrqg&s', 'Spicy pepperoni with cheese and sauce');

-- Insert into PizzaIngredients
INSERT INTO PizzaIngredients (PizzaID, IngredientID) VALUES
((SELECT PizzaID FROM Pizzas WHERE PizzaName = 'Margherita'), (SELECT IngredientID FROM Ingredients WHERE IngredientName = 'Mozzarella Cheese')),
((SELECT PizzaID FROM Pizzas WHERE PizzaName = 'Margherita'), (SELECT IngredientID FROM Ingredients WHERE IngredientName = 'Tomato Sauce')),
((SELECT PizzaID FROM Pizzas WHERE PizzaName = 'Pepperoni'), (SELECT IngredientID FROM Ingredients WHERE IngredientName = 'Mozzarella Cheese')),
((SELECT PizzaID FROM Pizzas WHERE PizzaName = 'Pepperoni'), (SELECT IngredientID FROM Ingredients WHERE IngredientName = 'Tomato Sauce'));

-- Insert into Desserts
INSERT INTO Desserts (DessertName, Price, ImageURL, Description) VALUES
('Chocolate Lava Cake', 6.99, 'https://www.billyparisi.com/wp-content/uploads/2022/02/lava-cake-1.jpg', 'Warm chocolate cake with a gooey center'),
('Tiramisu', 5.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbJYSqFnQMvHvkNrTikChMT4_lU3PAR0Toeg&s', 'Classic Italian dessert with coffee and cream');

-- Insert into DessertIngredients
INSERT INTO DessertIngredients (DessertID, IngredientID) VALUES
((SELECT DessertID FROM Desserts WHERE DessertName = 'Chocolate Lava Cake'), (SELECT IngredientID FROM Ingredients WHERE IngredientName = 'Mozzarella Cheese')),
((SELECT DessertID FROM Desserts WHERE DessertName = 'Tiramisu'), (SELECT IngredientID FROM Ingredients WHERE IngredientName = 'Mozzarella Cheese'));

-- Insert into Refreshments
INSERT INTO Refreshments (RefreshmentName, Price, ImageURL, Description) VALUES
('Cola', 2.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8OhMtoFHljiP1lTtpzSODXTu_-dJC1MpBrw&s', 'Refreshing carbonated cola drink'),
('Lemonade', 2.49, 'https://tofubud.com/cdn/shop/articles/is_lemonade_good_for_you_973715f3-4b84-479c-979c-1c126eab54bb_1024x.jpg?v=1612872855', 'Freshly squeezed lemonade');

-- Insert into Roles
INSERT INTO Roles (RoleName, Description) VALUES
('Customer', 'Regular customer with ordering privileges'),
('Admin', 'Administrator with full system access');

-- Insert into Users
INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName) VALUES
('johndoe', 'john@example.com', '1234', 'John', 'Doe'),
('janedoe', 'jane@example.com', '1234', 'Jane', 'Doe');

-- Insert into UserRoles
INSERT INTO UserRoles (UserID, RoleID) VALUES
((SELECT UserID FROM Users WHERE Username = 'johndoe'), (SELECT RoleID FROM Roles WHERE RoleName = 'Customer')),
((SELECT UserID FROM Users WHERE Username = 'janedoe'), (SELECT RoleID FROM Roles WHERE RoleName = 'Admin'));

-- Insert into OrderStatuses
INSERT INTO OrderStatuses (StatusName, Description) VALUES
('Pending', 'Order is being processed'),
('Delivered', 'Order has been delivered to the customer');

-- Insert into Orders
INSERT INTO Orders (UserID, StatusID, TotalAmount) VALUES
((SELECT UserID FROM Users WHERE Username = 'johndoe'), (SELECT StatusID FROM OrderStatuses WHERE StatusName = 'Pending'), 15.98),
((SELECT UserID FROM Users WHERE Username = 'janedoe'), (SELECT StatusID FROM OrderStatuses WHERE StatusName = 'Delivered'), 22.97);

-- Insert into OrderDetails
INSERT INTO OrderDetails (OrderID, CustomerName, CustomerAddress, CustomerPhone, CustomerEmail, DeliveryInstructions) VALUES
((SELECT OrderID FROM Orders WHERE TotalAmount = 15.98), 'John Doe', '123 Main St, City', '555-0123', 'john@example.com', 'Leave at front door'),
((SELECT OrderID FROM Orders WHERE TotalAmount = 22.97), 'Jane Doe', '456 Elm St, City', '555-0456', 'jane@example.com', 'Ring doorbell');

-- Insert into OrderItems
INSERT INTO OrderItems (OrderID, PizzaID, DessertID, RefreshmentID, Quantity, UnitPrice) VALUES
((SELECT OrderID FROM Orders WHERE TotalAmount = 15.98), (SELECT PizzaID FROM Pizzas WHERE PizzaName = 'Margherita'), NULL, NULL, 1, 12.99),
((SELECT OrderID FROM Orders WHERE TotalAmount = 15.98), NULL, NULL, (SELECT RefreshmentID FROM Refreshments WHERE RefreshmentName = 'Cola'), 1, 2.99),
((SELECT OrderID FROM Orders WHERE TotalAmount = 22.97), (SELECT PizzaID FROM Pizzas WHERE PizzaName = 'Pepperoni'), NULL, NULL, 1, 14.99),
((SELECT OrderID FROM Orders WHERE TotalAmount = 22.97), NULL, (SELECT DessertID FROM Desserts WHERE DessertName = 'Chocolate Lava Cake'), NULL, 1, 6.99),
((SELECT OrderID FROM Orders WHERE TotalAmount = 22.97), NULL, NULL, (SELECT RefreshmentID FROM Refreshments WHERE RefreshmentName = 'Lemonade'), 1, 2.49);
`;

const client = new Client({
    connectionString: databaseUrl,
});

async function executeSQL() {
    try {
        console.log('Connecting to the database...');
        await client.connect();

        console.log("🚀 ~ databaseUrl:", databaseUrl)

        console.log('Executing SQL commands...');
        await client.query(sqlCommands);

        console.log('Tables and data created successfully!');
    } catch (error) {
        console.error('Error executing SQL commands:', error.message);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

executeSQL();