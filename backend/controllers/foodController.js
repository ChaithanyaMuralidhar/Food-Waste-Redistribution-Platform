const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');
const { notifyNgosAndVolunteers } = require('../services/notificationService');
const { enrichListing } = require('../services/aiService');

exports.createListing = async (req, res) => {
  try {
    const { title, description, category, quantity, unit, expiryTime, pickupAddress } = req.body;

    if (!title || !quantity || !expiryTime || !pickupAddress) {
      return res.status(400).json({
        success: false,
        message: 'Title, quantity, expiry time, and pickup address are required',
      });
    }

    const aiData = enrichListing({ title, description, category, expiryTime });
    const listing = await FoodListing.create({
      restaurant: req.user._id,
      title,
      description,
      quantity,
      unit: unit || 'servings',
      expiryTime,
      pickupAddress,
      ...aiData,
    });

    await notifyNgosAndVolunteers(listing);

    res.status(201).json({ success: true, message: 'Food listing created', listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAvailableListings = async (req, res) => {
  try {
    const listings = await FoodListing.find({
      status: 'available',
      expiryTime: { $gt: new Date() },
    })
      .populate('restaurant', 'name organization phone address')
      .sort({ aiPriorityScore: -1, expiryTime: 1 });

    res.json({ success: true, count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const listings = await FoodListing.find({ restaurant: req.user._id })
      .populate('claimedBy', 'name organization phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id)
      .populate('restaurant', 'name organization phone address')
      .populate('claimedBy', 'name organization phone');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.claimListing = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (listing.status !== 'available') {
      return res.status(400).json({ success: false, message: 'This listing is no longer available' });
    }
    if (new Date(listing.expiryTime) <= new Date()) {
      listing.status = 'expired';
      await listing.save();
      return res.status(400).json({ success: false, message: 'This food has expired' });
    }

    listing.status = 'claimed';
    listing.claimedBy = req.user._id;
    listing.claimedAt = new Date();
    await listing.save();

    await Notification.create({
      recipient: listing.restaurant,
      type: 'claim_confirmed',
      title: 'Food claimed',
      message: `${req.user.name} has claimed "${listing.title}". Coordinate pickup details.`,
      foodListing: listing._id,
    });

    const populated = await FoodListing.findById(listing._id)
      .populate('restaurant', 'name organization phone')
      .populate('claimedBy', 'name organization phone');

    res.json({ success: true, message: 'Food claimed successfully', listing: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markPickedUp = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const isRestaurant = listing.restaurant.toString() === req.user._id.toString();
    const isClaimer = listing.claimedBy?.toString() === req.user._id.toString();
    if (!isRestaurant && !isClaimer) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    listing.status = 'picked_up';
    listing.pickedUpAt = new Date();
    await listing.save();

    res.json({ success: true, message: 'Marked as picked up', listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelListing = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (listing.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the restaurant can cancel' });
    }

    listing.status = 'cancelled';
    await listing.save();
    res.json({ success: true, message: 'Listing cancelled', listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyClaims = async (req, res) => {
  try {
    const listings = await FoodListing.find({ claimedBy: req.user._id })
      .populate('restaurant', 'name organization phone address')
      .sort({ claimedAt: -1 });

    res.json({ success: true, count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
