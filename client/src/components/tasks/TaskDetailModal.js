'use client';

import React, { useState } from 'react';
import { FiX, FiEdit2, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import useTaskStore from '../../store/taskStore';
import useAuthStore from '../../store/authStore';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import './TaskDetailModal.css';

const TaskDetailModal = ({ task, members, onClose }) => {
  const { updateTask, deleteTask, addComment } = useTaskStore();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    assigned_to: task.assigned_to || null,
    due_date: task.due_date || '',
  });
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(task.comments || []);

  const handleUpdateTask = async () => {
    const result = await updateTask(task.id, editData);
    if (result.success) {
      toast.success('Tâche mise à jour');
      setIsEditing(false);
    } else {
      toast.error(result.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      const result = await deleteTask(task.id);
      if (result.success) {
        toast.success('Tâche supprimée');
        onClose();
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      text: newComment,
      author_id: user?.id,
      author_name: user?.name,
      created_at: new Date().toISOString(),
    };

    setComments([...comments, comment]);
    setNewComment('');

    const result = await addComment(task.id, newComment);
    if (!result.success) {
      toast.error('Erreur lors de l\'ajout du commentaire');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'var(--success)',
      medium: 'var(--warning)',
      high: 'var(--danger)',
      critical: 'var(--danger)',
    };
    return colors[priority] || 'var(--text-muted)';
  };

  const getStatusLabel = (status) => {
    const labels = {
      todo: 'À faire',
      in_progress: 'En cours',
      done: 'Terminé',
    };
    return labels[status] || status;
  };

  const getAssignedMember = (memberId) => {
    return members?.find((m) => m.id === memberId);
  };

  return (
    <div className="task-detail-modal-overlay" onClick={onClose}>
      <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="task-detail-header">
          <h2>{!isEditing ? task.title : 'Modifier la tâche'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="task-detail-content">
          {!isEditing ? (
            <>
              {/* View Mode */}
              <div className="task-info-section">
                <div className="info-item">
                  <label>Statut</label>
                  <Badge variant="primary">{getStatusLabel(task.status)}</Badge>
                </div>
                <div className="info-item">
                  <label>Priorité</label>
                  <div
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {task.priority || 'medium'}
                  </div>
                </div>
                {task.assigned_to && (
                  <div className="info-item">
                    <label>Assigné à</label>
                    <p>{getAssignedMember(task.assigned_to)?.name}</p>
                  </div>
                )}
              </div>

              {task.description && (
                <div className="task-section">
                  <h3>Description</h3>
                  <p>{task.description}</p>
                </div>
              )}

              {task.due_date && (
                <div className="task-section">
                  <h3>Échéance</h3>
                  <p>{new Date(task.due_date).toLocaleDateString('fr-FR')}</p>
                </div>
              )}

              {/* Comments Section */}
              <div className="comments-section">
                <h3>
                  <FiMessageSquare /> Commentaires ({comments.length})
                </h3>
                <div className="add-comment">
                  <input
                    type="text"
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button size="small" onClick={handleAddComment}>
                    Envoyer
                  </Button>
                </div>
                <div className="comments-list">
                  {comments.map((comment, index) => (
                    <div key={index} className="comment-item">
                      <div className="comment-author">
                        <strong>{comment.author_name}</strong>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="task-actions">
                <Button
                  variant="outline"
                  icon={<FiEdit2 />}
                  onClick={() => setIsEditing(true)}
                >
                  Modifier
                </Button>
                <Button
                  variant="danger"
                  icon={<FiTrash2 />}
                  onClick={handleDeleteTask}
                >
                  Supprimer
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div className="form-section">
                <div className="form-group">
                  <label>Titre</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Statut</label>
                    <select
                      value={editData.status}
                      onChange={(e) =>
                        setEditData({ ...editData, status: e.target.value })
                      }
                    >
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Terminé</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priorité</label>
                    <select
                      value={editData.priority}
                      onChange={(e) =>
                        setEditData({ ...editData, priority: e.target.value })
                      }
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="critical">Critique</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assigné à</label>
                  <select
                    value={editData.assigned_to || ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        assigned_to: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">Non assigné</option>
                    {members?.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Échéance</label>
                  <input
                    type="date"
                    value={editData.due_date}
                    onChange={(e) =>
                      setEditData({ ...editData, due_date: e.target.value })
                    }
                  />
                </div>

                <div className="form-actions">
                  <Button onClick={handleUpdateTask}>Enregistrer</Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
