const express = require('express');
const { createProperty, getProperties, getMyProperties, getPropertyById, getFeaturedProperties, updateProperty, deleteProperty } = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Private routes (Landlord only)
router.get('/my', protect, authorize('landlord'), getMyProperties);
router.post('/', protect, authorize('landlord'), upload.array('photos', 3), createProperty);
router.put('/:id', protect, authorize('landlord'), upload.array('photos', 3), updateProperty);
router.delete('/:id', protect, authorize('landlord'), deleteProperty);

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:id', getPropertyById);

module.exports = router;
