const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173', // local development
  'https://online-phone-shop-website-1.onrender.com' // deployed frontend URL
];

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error(`❌ Blocked by CORS: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// PostgreSQL Connection Setup
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch((err) => console.error('❌ Database connection error:', err));

// --- API ROUTES ---

// Register
app.post('/api/register', async (req, res) => {
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
app.post('/api/login', async (req, res) => {
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

// --- Serve React Frontend in Production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  const frontendRoutes = ['/', '/cart', '/login', '/register', '/checkout'];
  frontendRoutes.forEach(route => {
    app.get(route, (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    });
  });
}

// 404 fallback for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log('🔓 Allowed origins for CORS:', allowedOrigins);
});
