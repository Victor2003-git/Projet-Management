'use client';

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <p className="subtitle">Connectez-vous pour accéder à vos projets</p>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="votre@email.com"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Votre mot de passe"
          required
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Se connecter
      </Button>

      <div className="auth-footer">
        Pas encore de compte ?{' '}
        <Link to="/register">Inscrivez-vous</Link>
      </div>
    </form>
  );
};

export default Login;
