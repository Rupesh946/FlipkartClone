const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const getUserId = () => parseInt(process.env.DEFAULT_USER_ID) || 1;

// Helper: get cart with product details
async function getCartItems(userId) {
  const result = await pool.query(`
    SELECT
      ci.id,
      ci.user_id,
      ci.product_id,
      ci.quantity,
      ci.created_at,
      p.name,
      p.price,
      p.original_price,
      p.discount_percent,
      p.images,
      p.brand,
      p.stock,
      p.rating
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = $1
    ORDER BY ci.created_at DESC
  `, [userId]);

  const items = result.rows;
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, itemCount, subtotal: parseFloat(subtotal.toFixed(2)) };
}

// GET /api/cart
router.get('/', async (req, res, next) => {
  try {
    const userId = getUserId();
    const cart = await getCartItems(userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// POST /api/cart
router.post('/', async (req, res, next) => {
  try {
    const userId = getUserId();
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    // Check product exists
    const productCheck = await pool.query('SELECT id, stock FROM products WHERE id = $1', [product_id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Upsert: insert or update quantity
    const result = await pool.query(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      RETURNING *
    `, [userId, product_id, quantity]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart/:productId
router.put('/:productId', async (req, res, next) => {
  try {
    const userId = getUserId();
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ error: 'quantity is required' });
    }

    if (quantity <= 0) {
      // Remove item
      await pool.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      return res.json({ removed: true });
    }

    const result = await pool.query(`
      UPDATE cart_items
      SET quantity = $1
      WHERE user_id = $2 AND product_id = $3
      RETURNING *
    `, [quantity, userId, productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/:productId — remove single item
router.delete('/:productId', async (req, res, next) => {
  try {
    const userId = getUserId();
    const { productId } = req.params;

    await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart — clear entire cart
router.delete('/', async (req, res, next) => {
  try {
    const userId = getUserId();
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
