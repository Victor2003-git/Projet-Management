'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiCheckSquare, FiClock, FiTrendingUp } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { myTasks, fetchMyTasks } = useTaskStore();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    upcomingDeadlines: 0
  });

  useEffect(() => {
    fetchProjects({ limit: 5 });
    fetchMyTasks();
  }, [fetchProjects, fetchMyTasks]);

  useEffect(() => {
    const activeTasks = myTasks.filter(t => t.status !== 'done').length;
    const completedTasks = myTasks.filter(t => t.status === 'done').length;
    const upcomingDeadlines = myTasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      const dueDate = new Date(t.due_date);
      const now = new Date();
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;

    setStats({
      totalProjects: projects.length,
      activeTasks,
      completedTasks,
      upcomingDeadlines
    });
  }, [projects, myTasks]);

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'success', label: 'Actif' },
      completed: { variant: 'primary', label: 'Terminé' },
      archived: { variant: 'default', label: 'Archivé' }
    };
    const { variant, label } = variants[status] || variants.active;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTaskStatusBadge = (status) => {
    const variants = {
      todo: { variant: 'default', label: 'À faire' },
      in_progress: { variant: 'warning', label: 'En cours' },
      done: { variant: 'success', label: 'Terminé' }
    };
    const { variant, label } = variants[status] || variants.todo;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: { variant: 'default', label: 'Basse' },
      medium: { variant: 'info', label: 'Moyenne' },
      high: { variant: 'danger', label: 'Haute' }
    };
    const { variant, label } = variants[priority] || variants.medium;
    return <Badge variant={variant} size="small">{label}</Badge>;
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Bienvenue, {user?.first_name} !</h1>
          <p>Voici un aperçu de votre activité</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <Card.Body>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <FiFolder style={{ color: 'var(--primary)' }} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalProjects}</span>
              <span className="stat-label">Projets</span>
            </div>
          </Card.Body>
        </Card>

        <Card className="stat-card">
          <Card.Body>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <FiCheckSquare style={{ color: 'var(--warning)' }} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.activeTasks}</span>
              <span className="stat-label">Tâches actives</span>
            </div>
          </Card.Body>
        </Card>

        <Card className="stat-card">
          <Card.Body>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <FiTrendingUp style={{ color: 'var(--success)' }} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.completedTasks}</span>
              <span className="stat-label">Terminées</span>
            </div>
          </Card.Body>
        </Card>

        <Card className="stat-card">
          <Card.Body>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <FiClock style={{ color: 'var(--danger)' }} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.upcomingDeadlines}</span>
              <span className="stat-label">Échéances proches</span>
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="dashboard-grid">
        {/* Recent Projects */}
        <Card className="dashboard-card">
          <Card.Header>
            <div className="card-header-content">
              <h3>Projets récents</h3>
              <Link to="/projects" className="view-all-link">Voir tout</Link>
            </div>
          </Card.Header>
          <Card.Body>
            {projects.length === 0 ? (
              <div className="empty-list">Aucun projet pour le moment</div>
            ) : (
              <div className="project-list">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="project-item"
                  >
                    <div className="project-info">
                      <h4>{project.title}</h4>
                      <span className="project-date">
                        Créé {formatDistanceToNow(new Date(project.created_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </span>
                    </div>
                    <div className="project-meta">
                      {getStatusBadge(project.status)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* My Tasks */}
        <Card className="dashboard-card">
          <Card.Header>
            <div className="card-header-content">
              <h3>Mes tâches</h3>
              <Link to="/my-tasks" className="view-all-link">Voir tout</Link>
            </div>
          </Card.Header>
          <Card.Body>
            {myTasks.length === 0 ? (
              <div className="empty-list">Aucune tâche assignée</div>
            ) : (
              <div className="task-list">
                {myTasks.filter(t => t.status !== 'done').slice(0, 5).map((task) => (
                  <div key={task.id} className="task-item">
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      <span className="task-project">{task.project_title}</span>
                    </div>
                    <div className="task-meta">
                      {getPriorityBadge(task.priority)}
                      {getTaskStatusBadge(task.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
