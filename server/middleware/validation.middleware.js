const { body, param, query, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validations pour l'authentification
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/\d/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre'),
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le prénom doit contenir entre 2 et 100 caractères')
    .escape(),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .escape(),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis'),
  handleValidationErrors
];

// Validations pour les projets
const validateProject = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Le titre doit contenir entre 3 et 255 caractères')
    .escape(),
  body('description')
    .optional()
    .trim()
    .escape(),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'archived'])
    .withMessage('Statut invalide'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide'),
  handleValidationErrors
];

// Validations pour les tâches
const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Le titre doit contenir entre 3 et 255 caractères')
    .escape(),
  body('description')
    .optional()
    .trim()
    .escape(),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Statut invalide'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priorité invalide'),
  body('assigned_to')
    .optional()
    .isInt()
    .withMessage('ID d\'assignation invalide'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Date d\'échéance invalide'),
  handleValidationErrors
];

// Validations pour les commentaires
const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Le commentaire doit contenir entre 1 et 5000 caractères'),
  handleValidationErrors
];

// Validation d'ID
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID invalide'),
  handleValidationErrors
];

// Validation de pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Numéro de page invalide'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite invalide (1-100)'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateProject,
  validateTask,
  validateComment,
  validateId,
  validatePagination
};
