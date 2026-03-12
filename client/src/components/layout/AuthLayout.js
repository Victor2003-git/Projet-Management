import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-brand">
          <h1 className="brand-logo">ProjetCollab</h1>
          <p className="brand-tagline">
            Plateforme de gestion de projets collaboratifs
          </p>
        </div>
        <div className="auth-content">
          <Outlet />
        </div>
      </div>
      <div className="auth-background">
        <div className="auth-bg-pattern"></div>
      </div>
    </div>
  );
};

export default AuthLayout;
