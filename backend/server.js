// ============================================
// COMPLETE BACKEND SERVER - server.js
// Copy this ENTIRE file into backend/server.js
// ============================================

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// DATABASE CONNECTION
// ============================================
let db;

async function connectDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Connected to MySQL Database:', process.env.DB_NAME);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// ============================================
// AUTH MIDDLEWARE
// ============================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

// ============================================
// AUTH ROUTES
// ============================================

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Get user from database
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ============================================
// INVENTORY ROUTES
// ============================================

// GET all inventory
app.get('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inventory ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// ADD inventory item
app.post('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const { itemName, category, quantity, reorderLevel, location, price, supplierId, supplier } = req.body;

    const [result] = await db.query(
      'INSERT INTO inventory (itemName, category, quantity, reorderLevel, location, price, supplierId, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [itemName, category, quantity || 0, reorderLevel || 10, location, price || 0, supplierId || null, supplier || '']
    );

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (itemName, action, userName, userRole, details) VALUES (?, ?, ?, ?, ?)',
      [itemName, 'Added', req.user.username, req.user.role, `Added new item: ${itemName}`]
    );

    res.json({ id: result.insertId, message: 'Item added successfully' });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// UPDATE inventory item
app.put('/api/inventory/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, category, quantity, reorderLevel, location, price, supplierId, supplier } = req.body;

    await db.query(
      'UPDATE inventory SET itemName = ?, category = ?, quantity = ?, reorderLevel = ?, location = ?, price = ?, supplierId = ?, supplier = ? WHERE id = ?',
      [itemName, category, quantity, reorderLevel, location, price, supplierId || null, supplier || '', id]
    );

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (itemName, action, userName, userRole, details) VALUES (?, ?, ?, ?, ?)',
      [itemName, 'Edited', req.user.username, req.user.role, `Updated item: ${itemName}`]
    );

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE inventory item
app.delete('/api/inventory/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get item name before deleting
    const [items] = await db.query('SELECT itemName FROM inventory WHERE id = ?', [id]);
    const itemName = items[0]?.itemName || 'Unknown';

    await db.query('DELETE FROM inventory WHERE id = ?', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (itemName, action, userName, userRole, details) VALUES (?, ?, ?, ?, ?)',
      [itemName, 'Deleted', req.user.username, req.user.role, `Deleted item: ${itemName}`]
    );

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ============================================
// TRANSACTION ROUTES
// ============================================

// GET all transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM transactions ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ADD transaction
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { itemId, itemName, transactionType, quantity, reason, userName, userRole, stockBefore, stockAfter } = req.body;

    // Insert transaction
    await db.query(
      'INSERT INTO transactions (itemId, itemName, transactionType, quantity, reason, userName, userRole, stockBefore, stockAfter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [itemId, itemName, transactionType, quantity, reason, userName, userRole, stockBefore, stockAfter]
    );

    // Update inventory quantity
    await db.query('UPDATE inventory SET quantity = ? WHERE id = ?', [stockAfter, itemId]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (itemName, action, userName, userRole, details) VALUES (?, ?, ?, ?, ?)',
      [itemName, 'Transaction', userName, userRole, `${transactionType}: ${quantity} units - ${reason}`]
    );

    res.json({ message: 'Transaction recorded successfully' });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// ============================================
// SUPPLIER ROUTES
// ============================================

// GET all suppliers
app.get('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM suppliers ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// ADD supplier
app.post('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const { supplierName, contactPerson, contactEmail, contactPhone, address, isActive } = req.body;

    const [result] = await db.query(
      'INSERT INTO suppliers (supplierName, contactPerson, contactEmail, contactPhone, address, isActive) VALUES (?, ?, ?, ?, ?, ?)',
      [supplierName, contactPerson, contactEmail || '', contactPhone || '', address || '', isActive ? 1 : 0]
    );

    res.json({ id: result.insertId, message: 'Supplier added successfully' });
  } catch (error) {
    console.error('Add supplier error:', error);
    res.status(500).json({ error: 'Failed to add supplier' });
  }
});

// UPDATE supplier
app.put('/api/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierName, contactPerson, contactEmail, contactPhone, address, isActive } = req.body;

    await db.query(
      'UPDATE suppliers SET supplierName = ?, contactPerson = ?, contactEmail = ?, contactPhone = ?, address = ?, isActive = ? WHERE id = ?',
      [supplierName, contactPerson, contactEmail || '', contactPhone || '', address || '', isActive ? 1 : 0, id]
    );

    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// DELETE supplier
app.delete('/api/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM suppliers WHERE id = ?', [id]);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// ============================================
// CATEGORY ROUTES
// ============================================

// GET all categories
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ADD category
app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    const [result] = await db.query(
      'INSERT INTO categories (categoryName, description) VALUES (?, ?)',
      [categoryName, description || '']
    );

    res.json({ id: result.insertId, message: 'Category added successfully' });
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// UPDATE category
app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    await db.query(
      'UPDATE categories SET categoryName = ?, description = ? WHERE id = ?',
      [categoryName, description || '', id]
    );

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category
app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============================================
// ACTIVITY LOGS ROUTES
// ============================================

// GET all activity logs
app.get('/api/activity-logs', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 1000');
    res.json(rows);
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// ============================================
// APPOINTMENT ROUTES
// ============================================

// GET all appointments
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM appointments ORDER BY date ASC, time ASC');
    // Parse JSON items
    const appointments = rows.map(apt => ({
      ...apt,
      items: typeof apt.items === 'string' ? JSON.parse(apt.items) : apt.items
    }));
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// ADD appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { supplierId, supplierName, date, time, status, items, notes, scheduledBy } = req.body;

    const [result] = await db.query(
      'INSERT INTO appointments (supplierId, supplierName, date, time, status, items, notes, scheduledBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [supplierId, supplierName, date, time, status, JSON.stringify(items), notes || '', scheduledBy]
    );

    res.json({ id: result.insertId, message: 'Appointment scheduled successfully' });
  } catch (error) {
    console.error('Add appointment error:', error);
    res.status(500).json({ error: 'Failed to schedule appointment' });
  }
});

// UPDATE appointment
app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierId, supplierName, date, time, status, items, notes } = req.body;

    await db.query(
      'UPDATE appointments SET supplierId = ?, supplierName = ?, date = ?, time = ?, status = ?, items = ?, notes = ? WHERE id = ?',
      [supplierId, supplierName, date, time, status, JSON.stringify(items), notes || '', id]
    );

    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// COMPLETE appointment
app.post('/api/appointments/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE appointments SET status = ? WHERE id = ?', ['completed', id]);
    res.json({ message: 'Appointment completed successfully' });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
});

// CANCEL appointment
app.post('/api/appointments/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', id]);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// ============================================
// DAMAGED ITEMS ROUTES
// ============================================

// GET all damaged items
app.get('/api/damaged-items', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM damaged_items ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get damaged items error:', error);
    res.status(500).json({ error: 'Failed to fetch damaged items' });
  }
});

// UPDATE damaged item
app.put('/api/damaged-items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    await db.query(
      'UPDATE damaged_items SET status = ?, notes = ? WHERE id = ?',
      [status, notes || '', id]
    );

    res.json({ message: 'Damaged item updated successfully' });
  } catch (error) {
    console.error('Update damaged item error:', error);
    res.status(500).json({ error: 'Failed to update damaged item' });
  }
});

// REMOVE damaged item
app.delete('/api/damaged-items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM damaged_items WHERE id = ?', [id]);
    res.json({ message: 'Damaged item removed successfully' });
  } catch (error) {
    console.error('Remove damaged item error:', error);
    res.status(500).json({ error: 'Failed to remove damaged item' });
  }
});

// ============================================
// START SERVER
// ============================================
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});