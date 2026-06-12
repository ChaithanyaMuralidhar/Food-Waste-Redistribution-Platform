const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['new_food', 'claim_confirmed', 'pickup_reminder', 'food_expired', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    foodListing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
