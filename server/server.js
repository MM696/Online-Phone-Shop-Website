const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'https://online-phone-shop-website-1.onrender.com', // Allow only your frontend origin
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL Connection Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Database connection error:", err));

// --- ROUTES ---

// Register
app.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3)',
      [fullName, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, fullName: user.full_name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Checkout
app.post('/api/checkout', async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    address,
    deliveryType,
    userId = null,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO checkout (user_id, full_name, email, phone_number, address, delivery_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, fullName, email, phoneNumber, address, deliveryType]
    );

    res.status(200).json({
      message: 'Checkout successful',
      order: result.rows[0],
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Failed to save checkout data' });
  }
});

// Default Route
app.get('/', (req, res) => {
  res.send('Backend API is running.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
