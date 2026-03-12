const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { pool } = require('../config/database');

// Créer un projet
exports.createProject = async (req, res) => {
  try {
    const { title, description, start_date, end_date } = req.body;

    const project = await Project.create({
      title,
      description,
      creator_id: req.userId,
      start_date,
      end_date
    });

    // Log d'activité
    await pool.execute(
      'INSERT INTO activity_logs (user_id, project_id, action, details) VALUES (?, ?, ?, ?)',
      [req.userId, project.id, 'project_created', JSON.stringify({ title })]
    );

    res.status(201).json({
      message: 'Projet créé avec succès',
      project
    });
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({ error: 'Erreur lors de la création du projet' });
  }
};

// Obtenir tous les projets de l'utilisateur
exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const result = await Project.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      search,
      userId: req.userId
    });

    res.json(result);
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
  }
};

// Obtenir un projet par ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Vérifier si l'utilisateur a accès au projet
    const isMember = await Project.isMember(req.params.id, req.userId);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé à ce projet' });
    }

    // Obtenir les statistiques des tâches
    const stats = await Task.getStats(req.params.id);
    project.stats = stats;

    res.json({ project });
  } catch (error) {
    console.error('Erreur récupération projet:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du projet' });
  }
};

// Mettre à jour un projet
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Seul le créateur ou un admin peut modifier
    const isOwner = await Project.isOwner(req.params.id, req.userId);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Seul le créateur peut modifier ce projet' });
    }

    const { title, description, status, start_date, end_date } = req.body;

    const updatedProject = await Project.update(req.params.id, {
      title: title || project.title,
      description: description !== undefined ? description : project.description,
      status: status || project.status,
      start_date: start_date || project.start_date,
      end_date: end_date || project.end_date
    });

    // Log d'activité
    await pool.execute(
      'INSERT INTO activity_logs (user_id, project_id, action, details) VALUES (?, ?, ?, ?)',
      [req.userId, req.params.id, 'project_updated', JSON.stringify({ title: updatedProject.title })]
    );

    // Notification temps réel
    const io = req.app.get('io');
    io.to(`project_${req.params.id}`).emit('projectUpdated', updatedProject);

    res.json({
      message: 'Projet mis à jour',
      project: updatedProject
    });
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du projet' });
  }
};

// Supprimer un projet
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Seul le créateur ou un admin peut supprimer
    const isOwner = await Project.isOwner(req.params.id, req.userId);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Seul le créateur peut supprimer ce projet' });
    }

    await Project.delete(req.params.id);

    res.json({ message: 'Projet supprimé' });
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
  }
};

// Ajouter un membre au projet
exports.addMember = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Vérifier les droits
    const isOwner = await Project.isOwner(projectId, req.userId);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    const members = await Project.addMember(projectId, userId, role);

    // Créer une notification pour le membre ajouté
    await Notification.create({
      user_id: userId,
      type: 'project_invite',
      message: `Vous avez été ajouté au projet "${project.title}"`,
      reference_id: projectId,
      reference_type: 'project'
    });

    // Notification temps réel
    const io = req.app.get('io');
    io.to(`user_${userId}`).emit('notification', {
      type: 'project_invite',
      projectId,
      projectTitle: project.title
    });

    res.json({
      message: 'Membre ajouté',
      members
    });
  } catch (error) {
    console.error('Erreur ajout membre:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du membre' });
  }
};

// Retirer un membre du projet
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Vérifier les droits
    const isOwner = await Project.isOwner(projectId, req.userId);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    // Ne pas permettre de retirer le créateur
    if (parseInt(userId) === project.creator_id) {
      return res.status(400).json({ error: 'Impossible de retirer le créateur du projet' });
    }

    await Project.removeMember(projectId, userId);

    res.json({ message: 'Membre retiré' });
  } catch (error) {
    console.error('Erreur retrait membre:', error);
    res.status(500).json({ error: 'Erreur lors du retrait du membre' });
  }
};

// Obtenir les membres du projet
exports.getMembers = async (req, res) => {
  try {
    const members = await Project.getMembers(req.params.id);
    res.json({ members });
  } catch (error) {
    console.error('Erreur récupération membres:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
  }
};

// Obtenir les statistiques du projet
exports.getProjectStats = async (req, res) => {
  try {
    const stats = await Task.getStats(req.params.id);
    
    // Obtenir l'activité récente
    const [activities] = await pool.execute(
      `SELECT al.*, u.first_name, u.last_name 
       FROM activity_logs al 
       JOIN users u ON al.user_id = u.id 
       WHERE al.project_id = ? 
       ORDER BY al.created_at DESC 
       LIMIT 10`,
      [req.params.id]
    );

    res.json({ stats, activities });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};
