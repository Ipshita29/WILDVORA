const express = require('express');
const router = express.Router();
const { getExperienceReviews, createReview, getMyReviews } = require('../controllers/ReviewController');
const { protect } = require('../services/Auth');

router.get('/experience/:id', getExperienceReviews);
router.get('/my', protect, getMyReviews);
router.post('/', protect, createReview);

module.exports = router;
