const { pool } = require('../config/database');

class Notification {
  // Créer une notification
  static async create(notificationData) {
    const { user_id, type, message, reference_id, reference_type } = notificationData;
    
    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, type, message, reference_id, reference_type) VALUES (?, ?, ?, ?, ?)',
      [user_id, type, message, reference_id || null, reference_type || null]
    );
    
    return this.findById(result.insertId);
  }

  // Trouver une notification par ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Obtenir les notifications d'un utilisateur
  static async findByUser(userId, options = {}) {
    const { unreadOnly = false, limit = 20 } = options;
    
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];
    
    if (unreadOnly) {
      query += ' AND is_read = FALSE';
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Marquer comme lue
  static async markAsRead(id) {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );
  }

  // Marquer toutes comme lues pour un utilisateur
  static async markAllAsRead(userId) {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
  }

  // Compter les non lues
  static async countUnread(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0].count;
  }

  // Supprimer une notification
  static async delete(id) {
    await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
  }
}

module.exports = Notification;
