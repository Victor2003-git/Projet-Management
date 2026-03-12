'use client';

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiFolder, 
  FiCheckSquare, 
  FiUser, 
  FiLogOut,
  FiX 
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Tableau de bord' },
    { path: '/projects', icon: FiFolder, label: 'Projets' },
    { path: '/my-tasks', icon: FiCheckSquare, label: 'Mes tâches' },
    { path: '/profile', icon: FiUser, label: 'Profil' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-logo">ProjetCollab</h1>
        <button className="sidebar-close" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <item.icon className="nav-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
          </div>
          <div className="user-details">
            <span className="user-name">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="user-role">
              {user?.role === 'admin' ? 'Administrateur' : 'Membre'}
            </span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
