const { pool } = require('../config/database');

class Comment {
  // Créer un commentaire
  static async create(commentData) {
    const { task_id, user_id, content } = commentData;
    
    const [result] = await pool.execute(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [task_id, user_id, content]
    );
    
    return this.findById(result.insertId);
  }

  // Trouver un commentaire par ID
  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT c.*, 
             u.first_name, u.last_name, u.email, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [id]);
    return rows[0];
  }

  // Obtenir les commentaires d'une tâche
  static async findByTask(taskId) {
    const [rows] = await pool.execute(`
      SELECT c.*, 
             u.first_name, u.last_name, u.email, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `, [taskId]);
    return rows;
  }

  // Mettre à jour un commentaire
  static async update(id, content) {
    await pool.execute(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, id]
    );
    return this.findById(id);
  }

  // Supprimer un commentaire
  static async delete(id) {
    await pool.execute('DELETE FROM comments WHERE id = ?', [id]);
  }
}

module.exports = Comment;
