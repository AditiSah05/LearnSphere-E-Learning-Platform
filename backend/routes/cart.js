const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getOrCreateCart(userId) {
  let row = db.prepare('SELECT * FROM carts WHERE userId = ?').get(userId);
  if (!row) {
    db.prepare('INSERT INTO carts (userId, items) VALUES (?, ?)').run(userId, '[]');
    row = { userId, items: '[]' };
  }
  return { ...row, items: JSON.parse(row.items) };
}

function saveCart(userId, items) {
  db.prepare('UPDATE carts SET items = ? WHERE userId = ?').run(JSON.stringify(items), userId);
}

router.get('/', (req, res) => {
  const cart = getOrCreateCart(req.userId);
  res.json({ items: cart.items });
});

router.post('/', (req, res) => {
  const { courseId, title, price, img } = req.body;
  if (!title) return res.status(400).json({ message: 'title required' });

  const cart = getOrCreateCart(req.userId);
  if (cart.items.some((i) => i.title === title)) {
    return res.status(200).json({ items: cart.items, added: false });
  }
  cart.items.push({ courseId, title, price, img });
  saveCart(req.userId, cart.items);
  res.status(201).json({ items: cart.items, added: true });
});

router.delete('/:title', (req, res) => {
  const cart = getOrCreateCart(req.userId);
  const items = cart.items.filter((i) => i.title !== req.params.title);
  saveCart(req.userId, items);
  res.json({ items });
});

router.post('/checkout', (req, res) => {
  const cart = getOrCreateCart(req.userId);
  const upsert = db.prepare(`
    INSERT INTO enrollments (userId, title, img, progress)
    VALUES (?, ?, ?, 0)
    ON CONFLICT(userId, title) DO NOTHING
  `);
  for (const item of cart.items) {
    upsert.run(req.userId, item.title, item.img);
  }
  saveCart(req.userId, []);
  res.json({ message: 'Checked out' });
});

module.exports = router;
