const pool = require('../config/db');

const VALID_CATEGORIES = ['books', 'electronics', 'furniture', 'clothing', 'other'];
const VALID_CONDITIONS = ['new', 'like_new', 'used', 'fair'];

// Small helper to keep validation consistent across create/update
function validateListingInput(body, { partial = false } = {}) {
  const errors = [];
  const { title, price, category, item_condition, seller_name, seller_contact } = body;

  if (!partial || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      errors.push('title is required and must be at least 3 characters');
    }
  }
  if (!partial || price !== undefined) {
    if (price === undefined || isNaN(price) || Number(price) <= 0) {
      errors.push('price is required and must be a positive number');
    }
  }
  if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (item_condition !== undefined && !VALID_CONDITIONS.includes(item_condition)) {
    errors.push(`item_condition must be one of: ${VALID_CONDITIONS.join(', ')}`);
  }
  if (!partial || seller_name !== undefined) {
    if (!seller_name || typeof seller_name !== 'string') {
      errors.push('seller_name is required');
    }
  }
  if (!partial || seller_contact !== undefined) {
    if (!seller_contact || typeof seller_contact !== 'string') {
      errors.push('seller_contact is required');
    }
  }
  return errors;
}

// GET /api/listings — supports optional ?category= and ?status= filters
exports.getAllListings = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    let query = 'SELECT * FROM listings WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/:id
exports.getListingById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM listings WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/listings
exports.createListing = async (req, res, next) => {
  try {
    const errors = validateListingInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const {
      title,
      description = '',
      price,
      category = 'other',
      item_condition = 'used',
      seller_name,
      seller_contact
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO listings (title, description, price, category, item_condition, seller_name, seller_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, category, item_condition, seller_name, seller_contact]
    );

    const [rows] = await pool.query('SELECT * FROM listings WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/listings/:id
exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM listings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const errors = validateListingInput(req.body, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const fields = ['title', 'description', 'price', 'category', 'item_condition', 'seller_name', 'seller_contact', 'status'];
    const updates = [];
    const values = [];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
    }

    values.push(id);
    await pool.query(`UPDATE listings SET ${updates.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM listings WHERE id = ?', [id]);
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/listings/:id
exports.deleteListing = async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT * FROM listings WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    await pool.query('DELETE FROM listings WHERE id = ?', [req.params.id]);
    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    next(err);
  }
};
