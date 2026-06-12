const FoodListing = require('../models/FoodListing');
const { classifyFood, enrichListing, getRecommendations } = require('../services/aiService');

exports.classify = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    const result = classifyFood(title, description);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.enrich = async (req, res) => {
  try {
    const { title, description, category, expiryTime } = req.body;
    if (!title || !expiryTime) {
      return res.status(400).json({ success: false, message: 'Title and expiry time are required' });
    }
    const enriched = enrichListing({ title, description, category, expiryTime });
    res.json({ success: true, enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const listings = await FoodListing.find({
      status: 'available',
      expiryTime: { $gt: new Date() },
    })
      .populate('restaurant', 'name organization')
      .limit(50);

    const recommendations = await getRecommendations(req.user, listings);
    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [totalListings, pickedUp, expired, available] = await Promise.all([
      FoodListing.countDocuments(),
      FoodListing.countDocuments({ status: 'picked_up' }),
      FoodListing.countDocuments({ status: 'expired' }),
      FoodListing.countDocuments({ status: 'available', expiryTime: { $gt: new Date() } }),
    ]);

    const impactScore = pickedUp * 10 + available * 2;
    res.json({
      success: true,
      stats: {
        totalListings,
        pickedUp,
        expired,
        available,
        impactScore,
        wasteReductionEstimate: `${pickedUp * 5} kg food redistributed (estimated)`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
