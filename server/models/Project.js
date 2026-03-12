const { pool } = require('../config/database');

class Project {
  // Créer un nouveau projet
  static async create(projectData) {
    const { title, description, creator_id, start_date, end_date } = projectData;
    
    const [result] = await pool.execute(
      'INSERT INTO projects (title, description, creator_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [title, description, creator_id, start_date || null, end_date || null]
    );
    
    // Ajouter le créateur comme propriétaire du projet
    await pool.execute(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, creator_id, 'owner']
    );
    
    return this.findById(result.insertId);
  }

  // Trouver un projet par ID avec détails
  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT p.*, 
             u.first_name as creator_first_name, 
             u.last_name as creator_last_name,
             u.email as creator_email
      FROM projects p
      JOIN users u ON p.creator_id = u.id
      WHERE p.id = ?
    `, [id]);
    
    if (rows[0]) {
      rows[0].members = await this.getMembers(id);
    }
    
    return rows[0];
  }

  // Obtenir tous les projets (avec pagination)
  static async findAll(options = {}) {
    const { page = 1, limit = 10, status, search, userId } = options;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT DISTINCT p.*, 
             u.first_name as creator_first_name, 
             u.last_name as creator_last_name,
             (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
             (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as completed_tasks
      FROM projects p
      JOIN users u ON p.creator_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (userId) {
      query += ' AND (p.creator_id = ? OR pm.user_id = ?)';
      params.push(userId, userId);
    }
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.execute(query, params);
    
    // Compter le total
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE 1=1
    `;
    const countParams = [];
    
    if (userId) {
      countQuery += ' AND (p.creator_id = ? OR pm.user_id = ?)';
      countParams.push(userId, userId);
    }
    
    if (status) {
      countQuery += ' AND p.status = ?';
      countParams.push(status);
    }
    
    if (search) {
      countQuery += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    
    return {
      projects: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  // Mettre à jour un projet
  static async update(id, projectData) {
    const { title, description, status, start_date, end_date } = projectData;
    
    await pool.execute(
      'UPDATE projects SET title = ?, description = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?',
      [title, description, status, start_date, end_date, id]
    );
    
    return this.findById(id);
  }

  // Supprimer un projet
  static async delete(id) {
    await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
  }

  // Obtenir les membres d'un projet
  static async getMembers(projectId) {
    const [rows] = await pool.execute(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.avatar, pm.role, pm.joined_at
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
    `, [projectId]);
    return rows;
  }

  // Ajouter un membre au projet
  static async addMember(projectId, userId, role = 'member') {
    await pool.execute(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = ?',
      [projectId, userId, role, role]
    );
    return this.getMembers(projectId);
  }

  // Retirer un membre du projet
  static async removeMember(projectId, userId) {
    await pool.execute(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );
  }

  // Vérifier si un utilisateur est membre d'un projet
  static async isMember(projectId, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );
    return rows.length > 0;
  }

  // Vérifier si un utilisateur est propriétaire d'un projet
  static async isOwner(projectId, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND creator_id = ?',
      [projectId, userId]
    );
    return rows.length > 0;
  }
}

module.exports = Project;
