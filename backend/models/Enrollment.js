const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    img: String,
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, title: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
