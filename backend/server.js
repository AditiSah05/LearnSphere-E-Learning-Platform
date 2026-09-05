require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const enrollmentRoutes = require('./routes/enrollment');
const reviewsRoutes = require('./routes/reviews');
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

// Routes that don't touch the DB (like the assistant) should work even if
// MongoDB isn't configured yet, so the server starts regardless.
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });
} else {
  console.warn('MONGODB_URI not set — auth/cart/wishlist/etc. will fail until it is configured.');
}
