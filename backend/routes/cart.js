const express = require('express');
const Cart = require('../models/Cart');
const Enrollment = require('../models/Enrollment');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

router.get('/', async (req, res) => {
  const cart = await getOrCreateCart(req.userId);
  res.json({ items: cart.items });
});

router.post('/', async (req, res) => {
  const { courseId, title, price, img } = req.body;
  if (!title) return res.status(400).json({ message: 'title required' });

  const cart = await getOrCreateCart(req.userId);
  if (cart.items.some((i) => i.title === title)) {
    return res.status(200).json({ items: cart.items, added: false });
  }
  cart.items.push({ courseId, title, price, img });
  await cart.save();
  res.status(201).json({ items: cart.items, added: true });
});

router.delete('/:title', async (req, res) => {
  const cart = await getOrCreateCart(req.userId);
  cart.items = cart.items.filter((i) => i.title !== req.params.title);
  await cart.save();
  res.json({ items: cart.items });
});

router.post('/checkout', async (req, res) => {
  const cart = await getOrCreateCart(req.userId);
  for (const item of cart.items) {
    await Enrollment.updateOne(
      { user: req.userId, title: item.title },
      { $setOnInsert: { user: req.userId, title: item.title, img: item.img, progress: 0 } },
      { upsert: true }
    );
  }
  cart.items = [];
  await cart.save();
  res.json({ message: 'Checked out' });
});

module.exports = router;
