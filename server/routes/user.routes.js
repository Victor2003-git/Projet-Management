const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const { validateId } = require('../middleware/validation.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Recherche d'utilisateurs
router.get('/search', userController.searchUsers);

// CRUD utilisateurs
router.get('/', userController.getAllUsers);
router.get('/:id', validateId, userController.getUserById);
router.put('/:id', validateId, userController.updateUser);
router.delete('/:id', validateId, requireAdmin, userController.deleteUser);

module.exports = router;
