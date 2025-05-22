import { Client } from 'pg';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not defined in the .env file.');
  throw new Error('DATABASE_URL is not defined');
}

const client = new Client({
  connectionString: databaseUrl,
});

await client.connect().catch((err) => {
  console.error('Failed to connect to the database:', err.message);
  throw new Error('Database connection failed');
});

export async function GET() {
  try {
    const query = `
      SELECT 
        o.OrderID,
        o.OrderDate,
        o.TotalAmount,
        o.OrderRefNumber,
        u.Username,
        os.StatusName,
        od.CustomerName,
        od.CustomerAddress,
        od.CustomerPhone,
        od.CustomerEmail,
        od.DeliveryInstructions,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'itemId', oi.OrderItemID,
            'pizzaName', p.PizzaName,
            'dessertName', d.DessertName,
            'refreshmentName', r.RefreshmentName,
            'quantity', oi.Quantity,
            'unitPrice', oi.UnitPrice
          )
        ) AS Items
      FROM Orders o
      LEFT JOIN Users u ON o.UserID = u.UserID
      LEFT JOIN OrderStatuses os ON o.StatusID = os.StatusID
      LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
      LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
      LEFT JOIN Pizzas p ON oi.PizzaID = p.PizzaID
      LEFT JOIN Desserts d ON oi.DessertID = d.DessertID
      LEFT JOIN Refreshments r ON oi.RefreshmentID = r.RefreshmentID
      GROUP BY o.OrderID, o.OrderDate, o.TotalAmount, o.OrderRefNumber, u.Username, os.StatusName, 
               od.CustomerName, od.CustomerAddress, od.CustomerPhone, od.CustomerEmail, od.DeliveryInstructions
      ORDER BY o.OrderDate DESC;
    `;

    const result = await client.query(query);

    const orders = result.rows.map((order) => ({
      id: order.orderid,
      orderDate: order.orderdate,
      totalAmount: parseFloat(order.totalamount),
      orderRef: order.orderrefnumber, // Map OrderRefNumber to the response
      username: order.username,
      status: order.statusname,
      customer: {
        name: order.customername,
        address: order.customeraddress,
        phone: order.customerphone,
        email: order.customeremail,
        deliveryInstructions: order.deliveryinstructions,
      },
      items: order.items
        .filter((item) => item.itemId !== null)
        .map((item) => ({
          itemId: item.itemId,
          name: item.pizzaName || item.dessertName || item.refreshmentName,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice),
        })),
    }));

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const response = await GET();
    res.status(response.status).setHeader('Content-Type', response.headers.get('Content-Type')).send(await response.text());
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

process.on('SIGTERM', async () => {
  await client.end();
  console.log('Database connection closed.');
});