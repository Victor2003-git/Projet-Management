'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import './ProjectForm.css';

const ProjectForm = ({ project, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'active',
    start_date: project?.start_date?.split('T')[0] || '',
    end_date: project?.end_date?.split('T')[0] || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Titre du projet *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Nom du projet"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Décrivez votre projet..."
          rows={4}
        />
      </div>

      {project && (
        <div className="form-group">
          <label htmlFor="status">Statut</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Actif</option>
            <option value="completed">Terminé</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="start_date">Date de début</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="end_date">Date de fin</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          {project ? 'Mettre à jour' : 'Créer le projet'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
