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
        d.DessertID,
        d.DessertName,
        d.Price,
        d.ImageURL,
        d.Description,
        ARRAY_AGG(i.IngredientName) AS Ingredients
      FROM Desserts d
      LEFT JOIN DessertIngredients di ON d.DessertID = di.DessertID
      LEFT JOIN Ingredients i ON di.IngredientID = i.IngredientID
      GROUP BY d.DessertID, d.DessertName, d.Price, d.ImageURL, d.Description
      ORDER BY d.DessertName;
    `;

    const result = await client.query(query);

    const desserts = result.rows.map((dessert) => ({
      id: dessert.dessertid,
      name: dessert.dessertname,
      price: parseFloat(dessert.price),
      imageUrl: dessert.imageurl,
      description: dessert.description,
      ingredients: dessert.ingredients.filter((ingredient) => ingredient !== null),
    }));

    return new Response(JSON.stringify(desserts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching desserts:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const response = await GET();
    res.status(response.status).send(await response.text());
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

process.on('SIGTERM', async () => {
  await client.end();
  console.log('Database connection closed.');
});