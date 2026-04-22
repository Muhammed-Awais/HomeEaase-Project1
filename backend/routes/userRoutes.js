const express = require('express');
const { getMe, updateProfile, deleteAccount, toggleFavorite, getFavorites } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.delete('/profile', protect, deleteAccount);

router.post('/favorites/:propertyId', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

module.exports = router;
