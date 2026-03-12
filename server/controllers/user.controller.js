const User = require('../models/User');

// Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

// Mettre à jour un utilisateur (admin seulement)
exports.updateUser = async (req, res) => {
  try {
    const { first_name, last_name, role, avatar } = req.body;
    
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const updatedUser = await User.update(req.params.id, {
      first_name: first_name || existingUser.first_name,
      last_name: last_name || existingUser.last_name,
      avatar: avatar || existingUser.avatar
    });

    // Mettre à jour le rôle si nécessaire (admin seulement)
    if (role && req.user.role === 'admin') {
      const { pool } = require('../config/database');
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
      updatedUser.role = role;
    }

    res.json({
      message: 'Utilisateur mis à jour',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
};

// Supprimer un utilisateur (admin seulement)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Empêcher la suppression de son propre compte
    if (parseInt(req.params.id) === req.userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await User.delete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};

// Rechercher des utilisateurs
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    const { pool } = require('../config/database');
    const [users] = await pool.execute(
      `SELECT id, email, first_name, last_name, avatar 
       FROM users 
       WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
       LIMIT 10`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json({ users });
  } catch (error) {
    console.error('Erreur recherche utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
};
