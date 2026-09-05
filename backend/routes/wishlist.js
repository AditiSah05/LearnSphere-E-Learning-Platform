const express = require('express');
const Wishlist = require('../models/Wishlist');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

async function getOrCreateWishlist(userId) {
  let wl = await Wishlist.findOne({ user: userId });
  if (!wl) wl = await Wishlist.create({ user: userId, items: [] });
  return wl;
}

router.get('/', async (req, res) => {
  const wl = await getOrCreateWishlist(req.userId);
  res.json({ items: wl.items });
});

router.post('/toggle', async (req, res) => {
  const { courseId, title, price, img } = req.body;
  if (!title) return res.status(400).json({ message: 'title required' });

  const wl = await getOrCreateWishlist(req.userId);
  const idx = wl.items.findIndex((i) => i.title === title);
  let saved;
  if (idx === -1) {
    wl.items.push({ courseId, title, price, img });
    saved = true;
  } else {
    wl.items.splice(idx, 1);
    saved = false;
  }
  await wl.save();
  res.json({ items: wl.items, saved });
});

router.delete('/:title', async (req, res) => {
  const wl = await getOrCreateWishlist(req.userId);
  wl.items = wl.items.filter((i) => i.title !== req.params.title);
  await wl.save();
  res.json({ items: wl.items });
});

module.exports = router;
