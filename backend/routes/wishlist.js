const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getOrCreateWishlist(userId) {
  let row = db.prepare('SELECT * FROM wishlists WHERE userId = ?').get(userId);
  if (!row) {
    db.prepare('INSERT INTO wishlists (userId, items) VALUES (?, ?)').run(userId, '[]');
    row = { userId, items: '[]' };
  }
  return { ...row, items: JSON.parse(row.items) };
}

function saveWishlist(userId, items) {
  db.prepare('UPDATE wishlists SET items = ? WHERE userId = ?').run(JSON.stringify(items), userId);
}

router.get('/', (req, res) => {
  const wl = getOrCreateWishlist(req.userId);
  res.json({ items: wl.items });
});

router.post('/toggle', (req, res) => {
  const { courseId, title, price, img } = req.body;
  if (!title) return res.status(400).json({ message: 'title required' });

  const wl = getOrCreateWishlist(req.userId);
  const idx = wl.items.findIndex((i) => i.title === title);
  let saved;
  if (idx === -1) {
    wl.items.push({ courseId, title, price, img });
    saved = true;
  } else {
    wl.items.splice(idx, 1);
    saved = false;
  }
  saveWishlist(req.userId, wl.items);
  res.json({ items: wl.items, saved });
});

router.delete('/:title', (req, res) => {
  const wl = getOrCreateWishlist(req.userId);
  const items = wl.items.filter((i) => i.title !== req.params.title);
  saveWishlist(req.userId, items);
  res.json({ items });
});

module.exports = router;
