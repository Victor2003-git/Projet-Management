const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { pool } = require('../config/database');

// Créer une tâche
exports.createTask = async (req, res) => {
  try {
    const { project_id, title, description, status, priority, assigned_to, due_date } = req.body;

    // Vérifier l'accès au projet
    const isMember = await Project.isMember(project_id, req.userId);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé au projet' });
    }

    const task = await Task.create({
      project_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      created_by: req.userId,
      due_date
    });

    // Si assigné à quelqu'un, créer une notification
    if (assigned_to && assigned_to !== req.userId) {
      const project = await Project.findById(project_id);
      await Notification.create({
        user_id: assigned_to,
        type: 'task_assigned',
        message: `Vous avez été assigné à la tâche "${title}"`,
        reference_id: task.id,
        reference_type: 'task'
      });

      // Notification temps réel
      const io = req.app.get('io');
      io.to(`user_${assigned_to}`).emit('notification', {
        type: 'task_assigned',
        taskId: task.id,
        taskTitle: title,
        projectTitle: project.title
      });
    }

    // Log d'activité
    await pool.execute(
      'INSERT INTO activity_logs (user_id, project_id, task_id, action, details) VALUES (?, ?, ?, ?, ?)',
      [req.userId, project_id, task.id, 'task_created', JSON.stringify({ title })]
    );

    // Notification temps réel au projet
    const io = req.app.get('io');
    io.to(`project_${project_id}`).emit('taskCreated', task);

    res.status(201).json({
      message: 'Tâche créée',
      task
    });
  } catch (error) {
    console.error('Erreur création tâche:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la tâche' });
  }
};

// Obtenir les tâches d'un projet
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assigned_to, priority, search } = req.query;

    // Vérifier l'accès au projet
    const isMember = await Project.isMember(projectId, req.userId);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé au projet' });
    }

    const tasks = await Task.findByProject(projectId, {
      status,
      assigned_to,
      priority,
      search
    });

    // Grouper par statut pour le kanban
    const grouped = {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      done: tasks.filter(t => t.status === 'done')
    };

    res.json({ tasks, grouped });
  } catch (error) {
    console.error('Erreur récupération tâches:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
  }
};

// Obtenir une tâche par ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    // Vérifier l'accès au projet
    const isMember = await Project.isMember(task.project_id, req.userId);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Erreur récupération tâche:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la tâche' });
  }
};

// Mettre à jour une tâche
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    // Vérifier l'accès au projet
    const isMember = await Project.isMember(task.project_id, req.userId);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { title, description, status, priority, assigned_to, due_date } = req.body;
    const oldStatus = task.status;
    const oldAssignee = task.assigned_to;

    const updatedTask = await Task.update(req.params.id, {
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      status: status || task.status,
      priority: priority || task.priority,
      assigned_to: assigned_to !== undefined ? assigned_to : task.assigned_to,
      due_date: due_date !== undefined ? due_date : task.due_date
    });

    // Notification si assignation change
    if (assigned_to && assigned_to !== oldAssignee && assigned_to !== req.userId) {
      await Notification.create({
        user_id: assigned_to,
        type: 'task_assigned',
        message: `Vous avez été assigné à la tâche "${updatedTask.title}"`,
        reference_id: updatedTask.id,
        reference_type: 'task'
      });

      const io = req.app.get('io');
      io.to(`user_${assigned_to}`).emit('notification', {
        type: 'task_assigned',
        taskId: updatedTask.id,
        taskTitle: updatedTask.title
      });
    }

    // Notification si statut change
    if (status && status !== oldStatus) {
      await pool.execute(
        'INSERT INTO activity_logs (user_id, project_id, task_id, action, details) VALUES (?, ?, ?, ?, ?)',
        [req.userId, task.project_id, task.id, 'task_status_changed', JSON.stringify({ from: oldStatus, to: status })]
      );
    }

    // Notification temps réel au projet
    const io = req.app.get('io');
    io.to(`project_${task.project_id}`).emit('taskUpdated', updatedTask);

    res.json({
      message: 'Tâche mise à jour',
      task: updatedTask
    });
  } catch (error) {
    console.error('Erreur mise à jour tâche:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche' });
  }
};

// Mettre à jour le statut d'une tâche (drag & drop)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, position } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    // Vérifier l'accès au projet
    const isMember = await Project.isMember(task.project_id, req.userId);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const oldStatus = task.status;
    const updatedTask = await Task.updateStatus(req.params.id, status, position);

    // Log si changement de statut
    if (status !== oldStatus) {
      await pool.execute(
        'INSERT INTO activity_logs (user_id, project_id, task_id, action, details) VALUES (?, ?, ?, ?, ?)',
        [req.userId, task.project_id, task.id, 'task_status_changed', JSON.stringify({ from: oldStatus, to: status })]
      );
    }

    // Notification temps réel
    const io = req.app.get('io');
    io.to(`project_${task.project_id}`).emit('taskStatusChanged', {
      taskId: task.id,
      status,
      position
    });

    res.json({
      message: 'Statut mis à jour',
      task: updatedTask
    });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

// Mettre à jour les positions des tâches (réorganisation)
exports.updateTaskPositions = async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Liste de tâches invalide' });
    }

    // Vérifier l'accès au projet de la première tâche
    const firstTask = await Task.findById(tasks[0].id);
    if (!firstTask) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    const isMember = await Project.isMember(firstTask.project_id, req.userId);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await Task.updatePositions(tasks);

    // Notification temps réel
    const io = req.app.get('io');
    io.to(`project_${firstTask.project_id}`).emit('tasksReordered', tasks);

    res.json({ message: 'Positions mises à jour' });
  } catch (error) {
    console.error('Erreur mise à jour positions:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des positions' });
  }
};

// Supprimer une tâche
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    // Vérifier les droits (créateur de la tâche, propriétaire du projet, ou admin)
    const isOwner = await Project.isOwner(task.project_id, req.userId);
    if (task.created_by !== req.userId && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await Task.delete(req.params.id);

    // Notification temps réel
    const io = req.app.get('io');
    io.to(`project_${task.project_id}`).emit('taskDeleted', { taskId: task.id });

    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    console.error('Erreur suppression tâche:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
  }
};

// Obtenir les tâches assignées à l'utilisateur connecté
exports.getMyTasks = async (req, res) => {
  try {
    const [tasks] = await pool.execute(`
      SELECT t.*, 
             p.title as project_title,
             u_created.first_name as created_first_name,
             u_created.last_name as created_last_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN users u_created ON t.created_by = u_created.id
      WHERE t.assigned_to = ?
      ORDER BY 
        CASE t.priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        t.due_date ASC
    `, [req.userId]);

    res.json({ tasks });
  } catch (error) {
    console.error('Erreur récupération mes tâches:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
  }
};
