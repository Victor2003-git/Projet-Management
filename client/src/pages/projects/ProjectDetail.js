'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiUsers, FiArrowLeft } from 'react-icons/fi';
import useProjectStore from '../../store/projectStore';
import useTaskStore from '../../store/taskStore';
import useAuthStore from '../../store/authStore';
import socketService from '../../services/socket';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ProjectForm from '../../components/projects/ProjectForm';
import TaskBoard from '../../components/tasks/TaskBoard';
import TaskForm from '../../components/tasks/TaskForm';
import MembersList from '../../components/projects/MembersList';
import toast from 'react-hot-toast';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentProject, fetchProject, updateProject, deleteProject, clearCurrentProject } = useProjectStore();
  const { fetchTasks, createTask, clearTasks, addTaskFromSocket, updateTaskFromSocket, removeTaskFromSocket } = useTaskStore();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        await fetchProject(id);
        await fetchTasks(id);
        setLoading(false);
        
        // Join project room for real-time updates
        socketService.joinProject(id);
      } catch (error) {
        toast.error('Projet non trouvé');
        navigate('/projects');
      }
    };

    loadProject();

    // Setup socket listeners
    socketService.onTaskCreated((task) => {
      if (task.project_id === parseInt(id)) {
        addTaskFromSocket(task);
      }
    });

    socketService.onTaskUpdated((task) => {
      if (task.project_id === parseInt(id)) {
        updateTaskFromSocket(task);
      }
    });

    socketService.onTaskDeleted(({ taskId }) => {
      removeTaskFromSocket(taskId);
    });

    return () => {
      clearCurrentProject();
      clearTasks();
      socketService.leaveProject(id);
    };
  }, [id]);

  const handleUpdateProject = async (data) => {
    const result = await updateProject(id, data);
    if (result.success) {
      toast.success('Projet mis à jour');
      setShowEditModal(false);
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteProject = async () => {
    const result = await deleteProject(id);
    if (result.success) {
      toast.success('Projet supprimé');
      navigate('/projects');
    } else {
      toast.error(result.error);
    }
  };

  const handleCreateTask = async (data) => {
    const result = await createTask({ ...data, project_id: parseInt(id) });
    if (result.success) {
      toast.success('Tâche créée');
      setShowTaskModal(false);
    } else {
      toast.error(result.error);
    }
  };

  const isOwner = currentProject?.creator_id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOwner || isAdmin;

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'success', label: 'Actif' },
      completed: { variant: 'primary', label: 'Terminé' },
      archived: { variant: 'default', label: 'Archivé' }
    };
    const { variant, label } = variants[status] || variants.active;
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!currentProject) {
    return null;
  }

  return (
    <div className="project-detail">
      <div className="project-header">
        <div className="project-header-left">
          <Button
            variant="ghost"
            size="small"
            icon={<FiArrowLeft />}
            onClick={() => navigate('/projects')}
          >
            Retour
          </Button>
          <div className="project-title-section">
            <h1>{currentProject.title}</h1>
            {getStatusBadge(currentProject.status)}
          </div>
          {currentProject.description && (
            <p className="project-description">{currentProject.description}</p>
          )}
        </div>
        <div className="project-header-right">
          <Button
            variant="outline"
            icon={<FiUsers />}
            onClick={() => setShowMembersModal(true)}
          >
            Membres ({currentProject.members?.length || 0})
          </Button>
          {canEdit && (
            <>
              <Button
                variant="outline"
                icon={<FiEdit2 />}
                onClick={() => setShowEditModal(true)}
              >
                Modifier
              </Button>
              <Button
                variant="danger"
                icon={<FiTrash2 />}
                onClick={() => setShowDeleteModal(true)}
              >
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      {currentProject.stats && (
        <div className="project-stats">
          <div className="stat-item">
            <span className="stat-value">{currentProject.stats.total || 0}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{currentProject.stats.todo || 0}</span>
            <span className="stat-label">À faire</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{currentProject.stats.in_progress || 0}</span>
            <span className="stat-label">En cours</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{currentProject.stats.done || 0}</span>
            <span className="stat-label">Terminées</span>
          </div>
        </div>
      )}

      {/* Task Board Header */}
      <div className="task-board-header">
        <h2>Tableau des tâches</h2>
        <Button icon={<FiPlus />} onClick={() => setShowTaskModal(true)}>
          Nouvelle tâche
        </Button>
      </div>

      {/* Task Board (Kanban) */}
      <TaskBoard projectId={parseInt(id)} members={currentProject.members || []} />

      {/* Edit Project Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier le projet"
        size="medium"
      >
        <ProjectForm
          project={currentProject}
          onSubmit={handleUpdateProject}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer le projet"
        size="small"
      >
        <div className="delete-confirmation">
          <p>Êtes-vous sûr de vouloir supprimer ce projet ?</p>
          <p className="warning-text">Cette action est irréversible et supprimera toutes les tâches associées.</p>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDeleteProject}>
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Nouvelle tâche"
        size="medium"
      >
        <TaskForm
          members={currentProject.members || []}
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskModal(false)}
        />
      </Modal>

      {/* Members Modal */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title="Membres du projet"
        size="medium"
      >
        <MembersList
          projectId={parseInt(id)}
          members={currentProject.members || []}
          isOwner={canEdit}
          creatorId={currentProject.creator_id}
        />
      </Modal>
    </div>
  );
};

export default ProjectDetail;
