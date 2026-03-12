'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import './Members.css';

const Members = () => {
  const { projectId } = useParams();
  const { currentProject, fetchProjectById, addMember, removeMember, updateMemberRole } = useProjectStore();
  const { user } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjectById(projectId);
  }, [projectId, fetchProjectById]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (showAddModal) {
      fetchUsers();
    }
  }, [showAddModal]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    try {
      await addMember(projectId, selectedUser, selectedRole);
      setShowAddModal(false);
      setSelectedUser('');
      setSelectedRole('member');
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await removeMember(projectId, userId);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    await updateMemberRole(projectId, userId, newRole);
  };

  const isOwner = currentProject?.members?.find(m => m.user_id === user?.id)?.role === 'owner';
  const isAdmin = currentProject?.members?.find(m => m.user_id === user?.id)?.role === 'admin' || isOwner;

  const existingMemberIds = currentProject?.members?.map(m => m.user_id) || [];
  const availableUsers = users.filter(u => !existingMemberIds.includes(u.id));
  const filteredUsers = availableUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeClass = (role) => {
    const classes = {
      owner: 'role-owner',
      admin: 'role-admin',
      member: 'role-member'
    };
    return classes[role] || 'role-member';
  };

  return (
    <div className="members-page">
      <div className="members-header">
        <div>
          <h1>Team Members</h1>
          <p className="members-subtitle">
            {currentProject?.name} - {currentProject?.members?.length || 0} members
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddModal(true)}>
            Add Member
          </Button>
        )}
      </div>

      <div className="members-grid">
        {currentProject?.members?.map((member) => (
          <Card key={member.user_id} className="member-card">
            <div className="member-avatar">
              {member.user_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="member-info">
              <h3>{member.user_name}</h3>
              <p>{member.user_email}</p>
              <Badge className={getRoleBadgeClass(member.role)}>
                {member.role}
              </Badge>
            </div>
            {isAdmin && member.role !== 'owner' && member.user_id !== user?.id && (
              <div className="member-actions">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                  className="role-select"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={() => handleRemoveMember(member.user_id)}
                >
                  Remove
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Team Member"
      >
        <form onSubmit={handleAddMember} className="add-member-form">
          <div className="form-group">
            <label>Search User</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Select User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="">Select a user...</option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-actions">
            <Button type="submit" disabled={loading || !selectedUser}>
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
