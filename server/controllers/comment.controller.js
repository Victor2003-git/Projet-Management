const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// Créer un commentaire
exports.createComment = async (req, res) => {
  try {
    const { task_id, content } = req.body;

    // Vérifier que la tâche existe
    const task = await Task.findById(task_id);
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    // Vérifier l'accès au projet
    const isMember = await Project.isMember(task.project_id, req.userId);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const comment = await Comment.create({
      task_id,
      user_id: req.userId,
      content
    });

    // Notifier l'assigné de la tâche s'il n'est pas l'auteur du commentaire
    if (task.assigned_to && task.assigned_to !== req.userId) {
      await Notification.create({
        user_id: task.assigned_to,
        type: 'comment_added',
        message: `Nouveau commentaire sur la tâche "${task.title}"`,
        reference_id: task_id,
        reference_type: 'task'
      });

      // Notification temps réel
      const io = req.app.get('io');
      io.to(`user_${task.assigned_to}`).emit('notification', {
        type: 'comment_added',
        taskId: task_id,
        taskTitle: task.title,
        commenterName: `${req.user.first_name} ${req.user.last_name}`
      });
    }

    // Notification temps réel au projet
    const io = req.app.get('io');
    io.to(`project_${task.project_id}`).emit('commentAdded', {
      taskId: task_id,
      comment
    });

    res.status(201).json({
      message: 'Commentaire ajouté',
      comment
    });
  } catch (error) {
    console.error('Erreur création commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
};

// Obtenir les commentaires d'une tâche
exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Vérifier que la tâche existe
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    // Vérifier l'accès au projet
    const isMember = await Project.isMember(task.project_id, req.userId);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const comments = await Comment.findByTask(taskId);

    res.json({ comments });
  } catch (error) {
    console.error('Erreur récupération commentaires:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
};

// Mettre à jour un commentaire
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    // Seul l'auteur peut modifier
    if (comment.user_id !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Vous ne pouvez pas modifier ce commentaire' });
    }

    const updatedComment = await Comment.update(req.params.id, content);

    res.json({
      message: 'Commentaire mis à jour',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Erreur mise à jour commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du commentaire' });
  }
};

// Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    // Seul l'auteur ou un admin peut supprimer
    if (comment.user_id !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Vous ne pouvez pas supprimer ce commentaire' });
    }

    // Récupérer la tâche pour la notification temps réel
    const task = await Task.findById(comment.task_id);

    await Comment.delete(req.params.id);

    // Notification temps réel
    if (task) {
      const io = req.app.get('io');
      io.to(`project_${task.project_id}`).emit('commentDeleted', {
        taskId: comment.task_id,
        commentId: comment.id
      });
    }

    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    console.error('Erreur suppression commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
  }
};
