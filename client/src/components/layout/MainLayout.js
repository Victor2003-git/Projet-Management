'use client';

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import socketService from '../../services/socket';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import toast from 'react-hot-toast';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const { addNotification, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    // Fetch initial unread count
    fetchUnreadCount();

    // Setup socket listeners
    socketService.onNotification((notification) => {
      addNotification(notification);
      toast(notification.message || 'Nouvelle notification', {
        icon: '🔔',
      });
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [addNotification, fetchUnreadCount]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="main-layout">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="main-content">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
    </div>
  );
};

export default MainLayout;
