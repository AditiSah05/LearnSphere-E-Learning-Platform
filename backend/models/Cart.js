const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      courseId: String,
      title: String,
      price: Number,
      img: String,
    },
  ],
});

module.exports = mongoose.model('Cart', cartSchema);
