const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['prepared', 'bakery', 'produce', 'dairy', 'beverages', 'other'],
      default: 'other',
    },
    quantity: { type: String, required: true },
    unit: { type: String, default: 'servings' },
    expiryTime: { type: Date, required: true },
    pickupAddress: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    status: {
      type: String,
      enum: ['available', 'claimed', 'picked_up', 'expired', 'cancelled'],
      default: 'available',
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    claimedAt: { type: Date },
    pickedUpAt: { type: Date },
    aiTags: [{ type: String }],
    aiPriorityScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

foodListingSchema.index({ location: '2dsphere' });
foodListingSchema.index({ status: 1, expiryTime: 1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
