const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');
const morgan = require('morgan'); // Only if installed

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIG ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://online-phone-shop-website.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Comment this line if you didn’t install morgan

// --- DATABASE CONFIG ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Database connection error:', err));

// ... Your API routes go here ...

// --- Serve frontend in production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  const frontendRoutes = ['/', '/cart', '/login', '/register', '/checkout'];
  frontendRoutes.forEach(route => {
    app.get(route, (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    });
  });
}

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
