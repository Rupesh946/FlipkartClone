const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const getUserId = () => parseInt(process.env.DEFAULT_USER_ID) || 1;

// Helper: get full order details with items
async function getOrderWithItems(orderId) {
  const orderResult = await pool.query(
    'SELECT * FROM orders WHERE id = $1',
    [orderId]
  );
  if (orderResult.rows.length === 0) return null;

  const itemsResult = await pool.query(`
    SELECT
      oi.*,
      p.images AS product_images,
      p.brand
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = $1
    ORDER BY oi.id ASC
  `, [orderId]);

  return { ...orderResult.rows[0], items: itemsResult.rows };
}

// GET /api/orders
router.get('/', async (req, res, next) => {
  try {
    const userId = getUserId();

    const ordersResult = await pool.query(`
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    // Fetch items for each order
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(`
          SELECT
            oi.*,
            p.images AS product_images,
            p.brand
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
          ORDER BY oi.id ASC
        `, [order.id]);
        return { ...order, items: itemsResult.rows };
      })
    );

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const userId = getUserId();
    const { id } = req.params;

    const order = await getOrderWithItems(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user_id !== userId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const userId = getUserId();
    const { shipping_name, shipping_address, shipping_phone, payment_method = 'COD' } = req.body;

    if (!shipping_name || !shipping_address) {
      return res.status(400).json({ error: 'shipping_name and shipping_address are required' });
    }

    // Get cart items
    const cartResult = await client.query(`
      SELECT
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.images,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
    `, [userId]);

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const cartItems = cartResult.rows;
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity, 0
    );

    await client.query('BEGIN');

    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (user_id, total_amount, shipping_address, shipping_name, shipping_phone, payment_method, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'placed')
      RETURNING *
    `, [userId, totalAmount.toFixed(2), shipping_address, shipping_name, shipping_phone || null, payment_method]);

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of cartItems) {
      const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;
      await client.query(`
        INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [order.id, item.product_id, item.name, imageUrl, item.quantity, item.price]);
    }

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    // Return full order with items
    const fullOrder = await getOrderWithItems(order.id);
    res.status(201).json(fullOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
