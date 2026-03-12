const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateComment, validateId } = require('../middleware/validation.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// CRUD Commentaires
router.post('/', validateComment, commentController.createComment);
router.get('/task/:taskId', commentController.getCommentsByTask);
router.put('/:id', validateId, validateComment, commentController.updateComment);
router.delete('/:id', validateId, commentController.deleteComment);

module.exports = router;
