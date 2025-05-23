import { Pool } from 'pg';
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not defined in the .env file.');
  process.exit(1);
}


const pool = new Pool({
  connectionString: databaseUrl,
});

export default async function handler(req, res) {
  let client;
  try {

    client = await pool.connect();


    const basesResult = await client.query('SELECT BaseID, BaseName, Description FROM PizzaBases');
    const bases = basesResult.rows;


    const toppingsResult = await client.query('SELECT IngredientID, IngredientName, IsVegan, IsGlutenFree FROM Ingredients');
    const toppings = toppingsResult.rows;

    res.status(200).json({ bases, toppings });
  } catch (error) {
    console.error('Error fetching bases and toppings:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {

    if (client) {
      client.release();
    }
  }
}