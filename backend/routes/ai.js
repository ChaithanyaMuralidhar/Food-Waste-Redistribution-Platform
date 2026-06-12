const express = require('express');
const { classify, enrich, getRecommendations, getStats } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/classify', protect, classify);
router.post('/enrich', protect, enrich);
router.get('/recommendations', protect, getRecommendations);
router.get('/stats', protect, getStats);

module.exports = router;
