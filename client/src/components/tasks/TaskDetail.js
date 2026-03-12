'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import './TaskDetail.css';

const TaskDetail = ({ task, onClose, onEdit }) => {
  const { user } = useAuthStore();
  const { comments, fetchComments, addComment, deleteComment } = useTaskStore();
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task?.id) {
      fetchComments(task.id);
    }
  }, [task?.id, fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      await addComment(task.id, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(task.id, commentId);
    }
  };

  const getPriorityClass = (priority) => {
    const classes = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent'
    };
    return classes[priority] || 'priority-medium';
  };

  const getStatusClass = (status) => {
    const classes = {
      todo: 'status-todo',
      in_progress: 'status-progress',
      review: 'status-review',
      done: 'status-done'
    };
    return classes[status] || 'status-todo';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!task) return null;

  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <h2>{task.title}</h2>
        <div className="task-detail-actions">
          <Button variant="secondary" onClick={onEdit}>Edit</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>

      <div className="task-detail-meta">
        <Badge className={getStatusClass(task.status)}>
          {task.status?.replace('_', ' ')}
        </Badge>
        <Badge className={getPriorityClass(task.priority)}>
          {task.priority}
        </Badge>
      </div>

      <div className="task-detail-body">
        <div className="task-detail-section">
          <h3>Description</h3>
          <p>{task.description || 'No description provided'}</p>
        </div>

        <div className="task-detail-info">
          <div className="info-item">
            <span className="info-label">Assigned to:</span>
            <span className="info-value">
              {task.assignee_name || 'Unassigned'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Due date:</span>
            <span className="info-value">{formatDate(task.due_date)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Created:</span>
            <span className="info-value">{formatDate(task.created_at)}</span>
          </div>
        </div>

        <div className="task-detail-section">
          <h3>Comments ({comments.length})</h3>
          
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
            />
            <Button type="submit" disabled={loading || !newComment.trim()}>
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.user_name}</span>
                    <span className="comment-date">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                  {comment.user_id === user?.id && (
                    <button
                      className="comment-delete"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
