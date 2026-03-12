const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateProject, validateId, validatePagination } = require('../middleware/validation.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// CRUD Projets
router.post('/', validateProject, projectController.createProject);
router.get('/', validatePagination, projectController.getProjects);
router.get('/:id', validateId, projectController.getProjectById);
router.put('/:id', validateId, validateProject, projectController.updateProject);
router.delete('/:id', validateId, projectController.deleteProject);

// Gestion des membres
router.get('/:id/members', validateId, projectController.getMembers);
router.post('/:id/members', validateId, projectController.addMember);
router.delete('/:id/members/:userId', validateId, projectController.removeMember);

// Statistiques
router.get('/:id/stats', validateId, projectController.getProjectStats);

module.exports = router;
