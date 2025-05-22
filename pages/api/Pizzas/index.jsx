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
        p.PizzaID,
        p.PizzaName,
        p.Price,
        p.ImageURL,
        p.Description,
        pb.BaseName,
        ARRAY_AGG(i.IngredientName) AS Ingredients
      FROM Pizzas p
      LEFT JOIN PizzaBases pb ON p.BaseID = pb.BaseID
      LEFT JOIN PizzaIngredients pi ON p.PizzaID = pi.PizzaID
      LEFT JOIN Ingredients i ON pi.IngredientID = i.IngredientID
      GROUP BY p.PizzaID, p.PizzaName, p.Price, p.ImageURL, p.Description, pb.BaseName
      ORDER BY p.PizzaName;
    `;

    const result = await client.query(query);

    const pizzas = result.rows.map((pizza) => ({
      id: pizza.pizzaid,
      name: pizza.pizzaname,
      price: parseFloat(pizza.price),
      imageUrl: pizza.imageurl,
      description: pizza.description,
      base: pizza.basename,
      ingredients: pizza.ingredients.filter((ingredient) => ingredient !== null),
    }));

    return new Response(JSON.stringify(pizzas), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching pizzas:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
process.on('SIGTERM', async () => {
  await client.end();
  console.log('Database connection closed.');
});
