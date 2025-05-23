const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

if (!databaseUrl || !jwtSecret) {
    console.error('DATABASE_URL or JWT_SECRET is not defined in the .env file.');
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
});

async function loginHandler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const client = new Client({
        connectionString: databaseUrl,
    });

    try {
        await client.connect();

        // Fetch user by email
        const userResult = await client.query(
            `SELECT u.UserID, u.Email,u.Username, u.PasswordHash, r.RoleName
             FROM Users u
             JOIN UserRoles ur ON u.UserID = ur.UserID
             JOIN Roles r ON ur.RoleID = r.RoleID
             WHERE u.Email = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.passwordhash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.userid, username: user.username , role: user.rolename },
            jwtSecret,
            { expiresIn: '1h' }
        );
        console.log("🚀 ~ loginHandler ~ token:", token);

        res.status(200).json({ message: 'Login successful', token, role: user.rolename });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.end(); // Ensure the client is disconnected
    }
}

export default loginHandler;