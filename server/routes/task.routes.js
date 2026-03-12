const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateTask, validateId } = require('../middleware/validation.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Mes tâches
router.get('/my-tasks', taskController.getMyTasks);

// CRUD Tâches
router.post('/', validateTask, taskController.createTask);
router.get('/project/:projectId', taskController.getTasksByProject);
router.get('/:id', validateId, taskController.getTaskById);
router.put('/:id', validateId, validateTask, taskController.updateTask);
router.delete('/:id', validateId, taskController.deleteTask);

// Mise à jour du statut (drag & drop)
router.patch('/:id/status', validateId, taskController.updateTaskStatus);

// Réorganisation des tâches
router.patch('/positions', taskController.updateTaskPositions);

module.exports = router;
