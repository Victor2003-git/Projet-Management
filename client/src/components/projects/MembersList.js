'use client';

import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiStar } from 'react-icons/fi';
import useProjectStore from '../../store/projectStore';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';
import './MembersList.css';

const MembersList = ({ projectId, members, isOwner, creatorId }) => {
  const { addMember, removeMember } = useProjectStore();
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setLoading(true);
    try {
      const result = await addMember(projectId, newMemberEmail);
      if (result.success) {
        toast.success('Membre ajouté au projet');
        setNewMemberEmail('');
        setShowAddMember(false);
      } else {
        toast.error(result.error || 'Erreur lors de l\'ajout du membre');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      const result = await removeMember(projectId, memberId);
      if (result.success) {
        toast.success('Membre supprimé du projet');
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="members-list-container">
      {/* Members List */}
      <div className="members-list">
        {members && members.length > 0 ? (
          members.map((member) => (
            <div key={member.id} className="member-item">
              <div className="member-info">
                <div className="member-avatar">
                  {member.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="member-details">
                  <div className="member-name-row">
                    <h4>{member.name}</h4>
                    {member.id === creatorId && (
                      <Badge variant="primary">
                        <FiCrown size={14} /> Propriétaire
                      </Badge>
                    )}
                  </div>
                  <p>{member.email}</p>
                </div>
              </div>
              {isOwner && member.id !== creatorId && (
                <Button
                  variant="danger"
                  size="small"
                  icon={<FiTrash2 />}
                  onClick={() => handleRemoveMember(member.id)}
                >
                  Supprimer
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="empty-message">Aucun membre dans ce projet</p>
        )}
      </div>

      {/* Add Member Section */}
      {isOwner && (
        <div className="add-member-section">
          {!showAddMember ? (
            <Button
              icon={<FiPlus />}
              onClick={() => setShowAddMember(true)}
              className="add-member-btn"
            >
              Ajouter un membre
            </Button>
          ) : (
            <form onSubmit={handleAddMember} className="add-member-form">
              <input
                type="email"
                placeholder="Email du membre à ajouter"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
              />
              <div className="form-actions">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Ajout...' : 'Ajouter'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAddMember(false);
                    setNewMemberEmail('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default MembersList;
