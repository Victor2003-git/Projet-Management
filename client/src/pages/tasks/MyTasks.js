'use client';

import React, { useEffect, useState } from 'react';
import { FiFilter, FiSearch, FiPlus } from 'react-icons/fi';
import useTaskStore from '../../store/taskStore';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import TaskForm from '../../components/tasks/TaskForm';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
import toast from 'react-hot-toast';
import './MyTasks.css';

const MyTasks = () => {
  const { user } = useAuthStore();
  const { tasks, fetchUserTasks, createTask } = useTaskStore();
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        await fetchUserTasks(user?.id);
        setLoading(false);
      } catch (error) {
        toast.error('Erreur lors du chargement des tâches');
        setLoading(false);
      }
    };
    loadTasks();
  }, [user?.id, fetchUserTasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleCreateTask = async (data) => {
    const result = await createTask(data);
    if (result.success) {
      toast.success('Tâche créée');
      setShowTaskModal(false);
    } else {
      toast.error(result.error || 'Erreur lors de la création');
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div className="my-tasks-page">
      <div className="my-tasks-header">
        <h1>Mes tâches</h1>
        <Button icon={<FiPlus />} onClick={() => setShowTaskModal(true)}>
          Nouvelle tâche
        </Button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Statut</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tous</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priorité</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">Toutes</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <Card className="empty-state">
            <p>Aucune tâche trouvée</p>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="task-item"
              onClick={() => setSelectedTask(task)}
            >
              <div className="task-item-content">
                <div className="task-title-section">
                  <h3>{task.title}</h3>
                  <Badge variant="default">{getStatusLabel(task.status)}</Badge>
                </div>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                <div className="task-meta">
                  <div
                    className="priority-indicator"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                    title={`Priorité: ${task.priority}`}
                  ></div>
                  {task.due_date && (
                    <span className="due-date">
                      Échéance: {new Date(task.due_date).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Nouvelle tâche"
        size="medium"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskModal(false)}
        />
      </Modal>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default MyTasks;
