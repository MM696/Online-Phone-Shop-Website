import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to orders.json
const ORDERS_PATH = path.join(__dirname, '../data/orders.json');

// Utility functions
function readOrders() {
  if (!fs.existsSync(ORDERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf-8') || '[]');
}

function writeOrders(orders) {
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
}

// POST /api/checkout
router.post('/', (req, res) => {
  const order = req.body;

  if (
    !order.fullName ||
    !order.email ||
    !order.phoneNumber ||
    !order.address ||
    !order.deliveryType
  ) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const orders = readOrders();
  orders.push({ ...order, date: new Date().toISOString() });
  writeOrders(orders);

  res.status(201).json({ message: 'Order received successfully' });
});

export default router;
