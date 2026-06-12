const express = require('express');
const {
  createListing,
  getAvailableListings,
  getMyListings,
  getListingById,
  claimListing,
  markPickedUp,
  cancelListing,
  getMyClaims,
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/available', protect, getAvailableListings);
router.get('/my-listings', protect, authorize('restaurant'), getMyListings);
router.get('/my-claims', protect, authorize('ngo', 'volunteer'), getMyClaims);
router.get('/:id', protect, getListingById);

router.post('/', protect, authorize('restaurant'), createListing);
router.post('/:id/claim', protect, authorize('ngo', 'volunteer'), claimListing);
router.post('/:id/pickup', protect, markPickedUp);
router.post('/:id/cancel', protect, authorize('restaurant'), cancelListing);

module.exports = router;
