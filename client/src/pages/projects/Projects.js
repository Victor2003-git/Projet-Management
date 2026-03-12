'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFolder } from 'react-icons/fi';
import useProjectStore from '../../store/projectStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ProjectForm from '../../components/projects/ProjectForm';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import './Projects.css';

const Projects = () => {
  const { projects, pagination, loading, fetchProjects, createProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProjects({ search: searchQuery, status: statusFilter });
  }, [fetchProjects, searchQuery, statusFilter]);

  const handleCreateProject = async (data) => {
    const result = await createProject(data);
    if (result.success) {
      toast.success('Projet créé avec succès');
      setShowCreateModal(false);
    } else {
      toast.error(result.error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'success', label: 'Actif' },
      completed: { variant: 'primary', label: 'Terminé' },
      archived: { variant: 'default', label: 'Archivé' }
    };
    const { variant, label } = variants[status] || variants.active;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getProgressPercentage = (project) => {
    if (!project.task_count || project.task_count === 0) return 0;
    return Math.round((project.completed_tasks / project.task_count) * 100);
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Projets</h1>
          <p>Gérez vos projets et collaborez avec votre équipe</p>
        </div>
        <Button icon={<FiPlus />} onClick={() => setShowCreateModal(true)}>
          Nouveau projet
        </Button>
      </div>

      {/* Filters */}
      <div className="projects-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="completed">Terminé</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FiFolder />
          <h3>Aucun projet trouvé</h3>
          <p>Créez votre premier projet pour commencer</p>
          <Button icon={<FiPlus />} onClick={() => setShowCreateModal(true)}>
            Créer un projet
          </Button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card hoverable className="project-card">
                <Card.Body>
                  <div className="project-card-header">
                    <h3>{project.title}</h3>
                    {getStatusBadge(project.status)}
                  </div>
                  <p className="project-description">
                    {project.description || 'Pas de description'}
                  </p>
                  <div className="project-progress">
                    <div className="progress-header">
                      <span>Progression</span>
                      <span>{getProgressPercentage(project)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgressPercentage(project)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="project-card-footer">
                    <span className="project-tasks">
                      {project.completed_tasks || 0}/{project.task_count || 0} tâches
                    </span>
                    <span className="project-date">
                      {formatDistanceToNow(new Date(project.created_at), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouveau projet"
        size="medium"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateModal(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default Projects;
