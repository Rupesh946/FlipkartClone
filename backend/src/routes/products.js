const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/products/categories/all — must be before /:id to avoid conflict
router.get('/categories/all', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.slug,
        c.image_url,
        COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { category, search, featured, limit = 20, offset = 0 } = req.query;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (category) {
      conditions.push(`c.slug = $${idx++}`);
      values.push(category);
    }
    if (search) {
      conditions.push(`p.name ILIKE $${idx++}`);
      values.push(`%${search}%`);
    }
    if (featured !== undefined) {
      conditions.push(`p.is_featured = $${idx++}`);
      values.push(featured === 'true');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const countQuery = `
      SELECT COUNT(p.id)::int AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const total = countResult.rows[0].total;

    // Products with pagination
    const dataQuery = `
      SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    const dataResult = await pool.query(dataQuery, [...values, parseInt(limit), parseInt(offset)]);

    res.json({
      products: dataResult.rows,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
