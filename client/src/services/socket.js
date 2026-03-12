import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  socket = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join user's personal room
  joinUserRoom(userId) {
    if (this.socket) {
      this.socket.emit('join', userId);
    }
  }

  // Join project room
  joinProject(projectId) {
    if (this.socket) {
      this.socket.emit('joinProject', projectId);
    }
  }

  // Leave project room
  leaveProject(projectId) {
    if (this.socket) {
      this.socket.emit('leaveProject', projectId);
    }
  }

  // Listen for notifications
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Listen for task events
  onTaskCreated(callback) {
    if (this.socket) {
      this.socket.on('taskCreated', callback);
    }
  }

  onTaskUpdated(callback) {
    if (this.socket) {
      this.socket.on('taskUpdated', callback);
    }
  }

  onTaskDeleted(callback) {
    if (this.socket) {
      this.socket.on('taskDeleted', callback);
    }
  }

  onTaskStatusChanged(callback) {
    if (this.socket) {
      this.socket.on('taskStatusChanged', callback);
    }
  }

  onTasksReordered(callback) {
    if (this.socket) {
      this.socket.on('tasksReordered', callback);
    }
  }

  // Listen for comment events
  onCommentAdded(callback) {
    if (this.socket) {
      this.socket.on('commentAdded', callback);
    }
  }

  onCommentDeleted(callback) {
    if (this.socket) {
      this.socket.on('commentDeleted', callback);
    }
  }

  // Listen for project events
  onProjectUpdated(callback) {
    if (this.socket) {
      this.socket.on('projectUpdated', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

const socketService = new SocketService();
export default socketService;
