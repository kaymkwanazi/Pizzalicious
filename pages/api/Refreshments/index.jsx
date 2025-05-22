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
        RefreshmentID,
        RefreshmentName,
        Price,
        ImageURL,
        Description
      FROM Refreshments
      ORDER BY RefreshmentName;
    `;

    const result = await client.query(query);

    const refreshments = result.rows.map((refreshment) => ({
      id: refreshment.refreshmentid,
      name: refreshment.refreshmentname,
      price: parseFloat(refreshment.price),
      imageUrl: refreshment.imageurl,
      description: refreshment.description,
    }));

    return new Response(JSON.stringify(refreshments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching refreshments:', error.message);
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