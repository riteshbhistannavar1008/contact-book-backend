const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /contacts — list all (with optional search + pagination)
router.get('/', (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (search) {
      const like = `%${search}%`;
      const where = ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?';
      const total = db.prepare('SELECT COUNT(*) as total FROM contacts' + where).get(like, like, like).total;
      const contacts = db.prepare('SELECT * FROM contacts' + where + ' ORDER BY name ASC LIMIT ? OFFSET ?').all(like, like, like, parseInt(limit), offset);
      return res.json({ data: contacts, total, page: parseInt(page), limit: parseInt(limit) });
    }

    const total    = db.prepare('SELECT COUNT(*) as total FROM contacts').get().total;
    const contacts = db.prepare('SELECT * FROM contacts ORDER BY name ASC LIMIT ? OFFSET ?').all(parseInt(limit), offset);
    res.json({ data: contacts, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /contacts/:id
router.get('/:id', (req, res) => {
  try {
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /contacts
router.post('/', (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

    const result = db.prepare(`
      INSERT INTO contacts (name, phone, email, address, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), phone || null, email || null, address || null, notes || null);

    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /contacts/:id
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Contact not found' });

    const { name, phone, email, address, notes } = req.body;
    if (name !== undefined && !name.trim()) return res.status(400).json({ error: 'name cannot be empty' });

    db.prepare(`
      UPDATE contacts
      SET name = ?, phone = ?, email = ?, address = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      (name || existing.name).trim(),
      phone   !== undefined ? phone   : existing.phone,
      email   !== undefined ? email   : existing.email,
      address !== undefined ? address : existing.address,
      notes   !== undefined ? notes   : existing.notes,
      req.params.id
    );

    res.json(db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /contacts/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Contact not found' });
    db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Contact deleted', id: parseInt(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
