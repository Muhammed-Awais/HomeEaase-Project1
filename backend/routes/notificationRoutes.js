const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
  clearAll,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markOneRead);
router.delete('/clear-all', clearAll);
router.delete('/:id', deleteNotification);

module.exports = router;
