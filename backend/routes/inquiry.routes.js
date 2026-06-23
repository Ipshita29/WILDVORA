const express = require('express');
const router  = express.Router();
const { getOrCreateInquiry, addMessage } = require('../controllers/InquiryController');
const { protect } = require('../services/Auth');

router.use(protect);

router.get('/experience/:experienceId', getOrCreateInquiry);
router.post('/:id/messages', addMessage);

module.exports = router;
