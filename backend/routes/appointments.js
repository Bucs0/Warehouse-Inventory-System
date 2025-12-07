// ============================================
// FILE: backend/routes/appointments.js (UPDATED WITH ACTIVITY LOGS)
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Helper function to create activity log
const createActivityLog = (itemName, action, userId, userName, userRole, details = '') => {
  const sql = `
    INSERT INTO activity_logs (itemName, action, userId, userName, userRole, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;
  db.query(sql, [itemName, action, userId, userName, userRole, details]);
};

// GET all appointments
router.get('/', authenticateToken, (req, res) => {
  const sql = 'SELECT * FROM appointments ORDER BY date ASC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
    
    // Parse items JSON for each appointment
    const appointments = results.map(apt => ({
      ...apt,
      items: typeof apt.items === 'string' ? JSON.parse(apt.items) : apt.items
    }));
    
    res.json(appointments);
  });
});

// POST create new appointment
router.post('/', authenticateToken, (req, res) => {
  const {
    supplierId,
    supplierName,
    date,
    time,
    status,
    items,
    notes,
    scheduledBy,
    scheduledDate
  } = req.body;

  // Validate required fields
  if (!supplierId || !supplierName || !date || !time || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO appointments 
    (supplierId, supplierName, date, time, status, items, notes, scheduledBy, scheduledDate, lastUpdated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    supplierId,
    supplierName,
    date,
    time,
    status || 'pending',
    JSON.stringify(items),
    notes || '',
    scheduledBy,
    scheduledDate || new Date().toLocaleString('en-PH')
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error creating appointment:', err);
      return res.status(500).json({ error: 'Failed to create appointment' });
    }

    // CREATE ACTIVITY LOG FOR EACH ITEM
    items.forEach(item => {
      createActivityLog(
        item.itemName,
        'Appointment Scheduled',
        req.user.id,
        req.user.name,
        req.user.role,
        `Restock appointment with ${supplierName} on ${date} at ${time} - Quantity: ${item.quantity}`
      );
    });

    res.json({ 
      id: result.insertId, 
      message: 'Appointment created successfully',
      ...req.body,
      items: items
    });
  });
});

// PUT update appointment
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    supplierId,
    supplierName,
    date,
    time,
    status,
    items,
    notes
  } = req.body;

  const sql = `
    UPDATE appointments 
    SET supplierId = ?, supplierName = ?, date = ?, time = ?, 
        status = ?, items = ?, notes = ?, lastUpdated = NOW()
    WHERE id = ?
  `;

  const values = [
    supplierId,
    supplierName,
    date,
    time,
    status,
    JSON.stringify(items),
    notes || '',
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating appointment:', err);
      return res.status(500).json({ error: 'Failed to update appointment' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // CREATE ACTIVITY LOG FOR UPDATED APPOINTMENT
    items.forEach(item => {
      createActivityLog(
        item.itemName,
        'Appointment Updated',
        req.user.id,
        req.user.name,
        req.user.role,
        `Updated restock appointment with ${supplierName} on ${date} at ${time}`
      );
    });

    res.json({ message: 'Appointment updated successfully' });
  });
});

// POST complete appointment
router.post('/:id/complete', authenticateToken, (req, res) => {
  const { id } = req.params;

  // First, get the appointment details
  db.query('SELECT * FROM appointments WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching appointment:', err);
      return res.status(500).json({ error: 'Failed to fetch appointment' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = results[0];
    const items = typeof appointment.items === 'string' 
      ? JSON.parse(appointment.items) 
      : appointment.items;

    // Start a transaction to ensure all updates happen together
    db.beginTransaction((err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Failed to start transaction' });
      }

      // Update appointment status to completed
      const updateAppointmentSql = `
        UPDATE appointments 
        SET status = 'completed', lastUpdated = NOW()
        WHERE id = ?
      `;

      db.query(updateAppointmentSql, [id], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error completing appointment:', err);
            res.status(500).json({ error: 'Failed to complete appointment' });
          });
        }

        // Update inventory quantities for each item
        let completed = 0;
        let hasError = false;

        items.forEach((item, index) => {
          // Update inventory quantity (add the restocked amount)
          const updateInventorySql = `
            UPDATE inventory 
            SET quantity = quantity + ?
            WHERE id = ?
          `;

          db.query(updateInventorySql, [item.quantity, item.itemId], (err, result) => {
            if (err && !hasError) {
              hasError = true;
              return db.rollback(() => {
                console.error('Error updating inventory:', err);
                res.status(500).json({ error: 'Failed to update inventory' });
              });
            }

            if (!hasError) {
              // Create transaction log for the restock
              const transactionSql = `
                INSERT INTO transactions 
                (itemId, itemName, transactionType, quantity, reason, userId, userName, userRole, timestamp, stockBefore, stockAfter)
                VALUES (?, ?, 'IN', ?, ?, ?, ?, ?, NOW(), 
                  (SELECT quantity - ? FROM inventory WHERE id = ?),
                  (SELECT quantity FROM inventory WHERE id = ?))
              `;

              db.query(transactionSql, [
                item.itemId,
                item.itemName,
                item.quantity,
                `Restock from appointment with ${appointment.supplierName}`,
                req.user.id,
                req.user.name,
                req.user.role,
                item.quantity,
                item.itemId,
                item.itemId
              ], (err) => {
                if (err && !hasError) {
                  hasError = true;
                  return db.rollback(() => {
                    console.error('Error creating transaction:', err);
                    res.status(500).json({ error: 'Failed to create transaction' });
                  });
                }

                if (!hasError) {
                  // Create activity log
                  createActivityLog(
                    item.itemName,
                    'Appointment Completed',
                    req.user.id,
                    req.user.name,
                    req.user.role,
                    `Completed restock appointment with ${appointment.supplierName} - Received ${item.quantity} units`
                  );

                  completed++;

                  // If all items processed, commit the transaction
                  if (completed === items.length) {
                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => {
                          console.error('Error committing transaction:', err);
                          res.status(500).json({ error: 'Failed to commit changes' });
                        });
                      }

                      res.json({ 
                        message: 'Appointment completed successfully',
                        itemsRestocked: items.length,
                        totalUnits: items.reduce((sum, i) => sum + i.quantity, 0)
                      });
                    });
                  }
                }
              });
            }
          });
        });
      });
    });
  });
});

// POST cancel appointment
router.post('/:id/cancel', authenticateToken, (req, res) => {
  const { id } = req.params;

  // First, get the appointment details
  db.query('SELECT * FROM appointments WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching appointment:', err);
      return res.status(500).json({ error: 'Failed to fetch appointment' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = results[0];
    const items = typeof appointment.items === 'string' 
      ? JSON.parse(appointment.items) 
      : appointment.items;

    // Update appointment status to cancelled
    const updateSql = `
      UPDATE appointments 
      SET status = 'cancelled', lastUpdated = NOW()
      WHERE id = ?
    `;

    db.query(updateSql, [id], (err, result) => {
      if (err) {
        console.error('Error cancelling appointment:', err);
        return res.status(500).json({ error: 'Failed to cancel appointment' });
      }

      // CREATE ACTIVITY LOG FOR CANCELLED APPOINTMENT
      items.forEach(item => {
        createActivityLog(
          item.itemName,
          'Appointment Cancelled',
          req.user.id,
          req.user.name,
          req.user.role,
          `Cancelled restock appointment with ${appointment.supplierName} scheduled for ${appointment.date}`
        );
      });

      res.json({ message: 'Appointment cancelled successfully' });
    });
  });
});

module.exports = router;