const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { saltRounds } = require('../config/auth');

class User {
  // Créer un nouvel utilisateur
  static async create(userData) {
    const { email, password, first_name, last_name, role = 'member' } = userData;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, first_name, last_name, role]
    );
    
    return { id: result.insertId, email, first_name, last_name, role };
  }

  // Trouver un utilisateur par email
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Trouver un utilisateur par ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, first_name, last_name, role, avatar, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Obtenir tous les utilisateurs
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, email, first_name, last_name, role, avatar, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  // Mettre à jour un utilisateur
  static async update(id, userData) {
    const { first_name, last_name, avatar } = userData;
    
    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, avatar = ? WHERE id = ?',
      [first_name, last_name, avatar, id]
    );
    
    return this.findById(id);
  }

  // Mettre à jour le mot de passe
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
  }

  // Vérifier le mot de passe
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Supprimer un utilisateur
  static async delete(id) {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = User;
