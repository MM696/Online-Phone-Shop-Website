// server.js
import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL config
const pool = new Pool({
  user: 'your_pg_username',
  host: 'localhost',
  database: 'your_database_name',
  password: 'your_pg_password',
  port: 5432,
});

// POST /signup route
app.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // 1. Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user
    await pool.query(
      'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3)',
      [fullName, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. Success
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
