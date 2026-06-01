const express = require('express');
const router = express.Router();
const { getExperiences, getExperience, createExperience, seedExperiences } = require('../controllers/ExperienceController');

router.get('/', getExperiences);
router.post('/seed/demo', seedExperiences);
router.get('/:id', getExperience);
router.post('/', createExperience);

module.exports = router;
