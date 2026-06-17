const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, toggleWishlist, changePassword } = require('../controllers/UserController');
const { protect } = require('../services/Auth');
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/wishlist/:experienceId', toggleWishlist);
router.patch('/password', changePassword);
module.exports = router;
