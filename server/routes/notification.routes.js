const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateId } = require('../middleware/validation.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes notifications
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', validateId, notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', validateId, notificationController.deleteNotification);

module.exports = router;
