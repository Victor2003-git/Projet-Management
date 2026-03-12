const { pool } = require('../config/database');

class Task {
  // Créer une nouvelle tâche
  static async create(taskData) {
    const { 
      project_id, title, description, status = 'todo', 
      priority = 'medium', assigned_to, created_by, due_date 
    } = taskData;
    
    // Obtenir la position max pour le statut
    const [maxPos] = await pool.execute(
      'SELECT MAX(position) as max_pos FROM tasks WHERE project_id = ? AND status = ?',
      [project_id, status]
    );
    const position = (maxPos[0].max_pos || 0) + 1;
    
    const [result] = await pool.execute(
      `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date, position) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [project_id, title, description, status, priority, assigned_to || null, created_by, due_date || null, position]
    );
    
    return this.findById(result.insertId);
  }

  // Trouver une tâche par ID
  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT t.*, 
             u_assigned.first_name as assigned_first_name,
             u_assigned.last_name as assigned_last_name,
             u_assigned.email as assigned_email,
             u_created.first_name as created_first_name,
             u_created.last_name as created_last_name
      FROM tasks t
      LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
      JOIN users u_created ON t.created_by = u_created.id
      WHERE t.id = ?
    `, [id]);
    return rows[0];
  }

  // Obtenir les tâches d'un projet
  static async findByProject(projectId, options = {}) {
    const { status, assigned_to, priority, search } = options;
    
    let query = `
      SELECT t.*, 
             u_assigned.first_name as assigned_first_name,
             u_assigned.last_name as assigned_last_name,
             u_assigned.avatar as assigned_avatar,
             u_created.first_name as created_first_name,
             u_created.last_name as created_last_name
      FROM tasks t
      LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
      JOIN users u_created ON t.created_by = u_created.id
      WHERE t.project_id = ?
    `;
    
    const params = [projectId];
    
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    
    if (assigned_to) {
      query += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }
    
    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }
    
    if (search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY t.position ASC, t.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Mettre à jour une tâche
  static async update(id, taskData) {
    const { title, description, status, priority, assigned_to, due_date } = taskData;
    
    await pool.execute(
      `UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ? WHERE id = ?`,
      [title, description, status, priority, assigned_to || null, due_date || null, id]
    );
    
    return this.findById(id);
  }

  // Mettre à jour le statut d'une tâche
  static async updateStatus(id, status, position = null) {
    if (position !== null) {
      await pool.execute(
        'UPDATE tasks SET status = ?, position = ? WHERE id = ?',
        [status, position, id]
      );
    } else {
      await pool.execute(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [status, id]
      );
    }
    return this.findById(id);
  }

  // Mettre à jour les positions des tâches (pour drag & drop)
  static async updatePositions(tasks) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      for (const task of tasks) {
        await connection.execute(
          'UPDATE tasks SET status = ?, position = ? WHERE id = ?',
          [task.status, task.position, task.id]
        );
      }
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Supprimer une tâche
  static async delete(id) {
    await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
  }

  // Statistiques des tâches pour un projet
  static async getStats(projectId) {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'done' THEN 1 ELSE 0 END) as overdue
      FROM tasks WHERE project_id = ?
    `, [projectId]);
    return rows[0];
  }
}

module.exports = Task;
