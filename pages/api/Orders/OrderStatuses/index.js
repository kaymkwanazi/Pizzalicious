import { Client } from 'pg';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;
console.log("🚀 ~ databaseUrl:", databaseUrl)

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
        StatusID,
        StatusName,
        Description
      FROM OrderStatuses
      ORDER BY StatusName ASC;
    `;

    const result = await client.query(query);

    const statuses = result.rows.map((status) => ({
      id: status.statusid,
      name: status.statusname,
      description: status.description,
    }));

    return new Response(JSON.stringify(statuses), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching order statuses:', error.message);
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