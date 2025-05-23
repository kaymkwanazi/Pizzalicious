const { Client } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is not defined in the .env file.');
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
});

async function handlePlaceOrder(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, items, customerInfo, totalAmount } = req.body;

    if (!userId || !items || !customerInfo || !totalAmount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await client.connect();

        // Insert into Orders table
        const orderResult = await client.query(
            `INSERT INTO Orders (UserID, StatusID, TotalAmount, OrderRefNumber)
             VALUES ($1, (SELECT StatusID FROM OrderStatuses WHERE StatusName = 'Pending'), $2, 'ORD-' || $3 || '-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '-' || nextval('order_ref_seq'))
             RETURNING OrderID`,
            [userId, totalAmount, userId]
        );
        const orderId = orderResult.rows[0].orderid;

        // Insert into OrderDetails table
        await client.query(
            `INSERT INTO OrderDetails (OrderID, CustomerName, CustomerAddress, CustomerPhone, CustomerEmail, DeliveryInstructions)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [orderId, customerInfo.name, customerInfo.address, customerInfo.phone, customerInfo.email, customerInfo.instructions]
        );

        // Insert into OrderItems table
        for (const item of items) {
            await client.query(
                `INSERT INTO OrderItems (OrderID, PizzaID, DessertID, RefreshmentID, Quantity, UnitPrice)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [orderId, item.pizzaId, item.dessertId, item.refreshmentId, item.quantity, item.unitPrice]
            );
        }

        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (error) {
        console.error('Error placing order:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.end();
    }
}

async function handleUpdateOrderStatus(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { orderId, statusName } = req.body;

    if (!orderId || !statusName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await client.connect();

        // Update order status
        const result = await client.query(
            `UPDATE Orders
             SET StatusID = (SELECT StatusID FROM OrderStatuses WHERE StatusName = $1)
             WHERE OrderID = $2`,
            [statusName, orderId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Order not found or invalid status' });
        }

        res.status(200).json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.end();
    }
}

module.exports = async (req, res) => {
    if (req.url === '/place') {
        await handlePlaceOrder(req, res);
    } else if (req.url === '/update-status') {
        await handleUpdateOrderStatus(req, res);
    } else {
        res.status(404).json({ error: 'Endpoint not found' });
    }
};