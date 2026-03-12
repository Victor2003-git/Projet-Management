import { create } from 'zustand';
import { tasksAPI } from '../services/api';

const useTaskStore = create((set, get) => ({
  tasks: [],
  groupedTasks: {
    todo: [],
    in_progress: [],
    done: [],
  },
  currentTask: null,
  myTasks: [],
  loading: false,
  error: null,

  // Fetch tasks by project
  fetchTasks: async (projectId, params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await tasksAPI.getByProject(projectId, params);
      set({
        tasks: response.data.tasks,
        groupedTasks: response.data.grouped,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement des tâches',
        loading: false,
      });
    }
  },

  // Fetch my tasks
  fetchMyTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await tasksAPI.getMyTasks();
      set({ myTasks: response.data.tasks, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement',
        loading: false,
      });
    }
  },

  // Create task
  createTask: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await tasksAPI.create(data);
      const newTask = response.data.task;
      set((state) => {
        const status = newTask.status;
        return {
          tasks: [...state.tasks, newTask],
          groupedTasks: {
            ...state.groupedTasks,
            [status]: [...state.groupedTasks[status], newTask],
          },
          loading: false,
        };
      });
      return { success: true, task: newTask };
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la création';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Update task
  updateTask: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await tasksAPI.update(id, data);
      const updatedTask = response.data.task;
      set((state) => {
        // Remove from old status group and add to new
        const oldTask = state.tasks.find((t) => t.id === id);
        const newGrouped = { ...state.groupedTasks };
        
        if (oldTask && oldTask.status !== updatedTask.status) {
          newGrouped[oldTask.status] = newGrouped[oldTask.status].filter(
            (t) => t.id !== id
          );
          newGrouped[updatedTask.status] = [
            ...newGrouped[updatedTask.status],
            updatedTask,
          ];
        } else {
          newGrouped[updatedTask.status] = newGrouped[updatedTask.status].map(
            (t) => (t.id === id ? updatedTask : t)
          );
        }

        return {
          tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
          groupedTasks: newGrouped,
          currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
          loading: false,
        };
      });
      return { success: true, task: updatedTask };
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la mise à jour';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Update task status (for drag & drop)
  updateTaskStatus: async (id, status, position) => {
    try {
      const response = await tasksAPI.updateStatus(id, { status, position });
      const updatedTask = response.data.task;
      
      set((state) => {
        const oldTask = state.tasks.find((t) => t.id === id);
        const newGrouped = { ...state.groupedTasks };
        
        if (oldTask) {
          newGrouped[oldTask.status] = newGrouped[oldTask.status].filter(
            (t) => t.id !== id
          );
          newGrouped[status] = [...newGrouped[status], updatedTask].sort(
            (a, b) => a.position - b.position
          );
        }

        return {
          tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
          groupedTasks: newGrouped,
        };
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Optimistic update for drag & drop
  moveTask: (taskId, sourceStatus, destStatus, newIndex) => {
    set((state) => {
      const task = state.groupedTasks[sourceStatus].find((t) => t.id === taskId);
      if (!task) return state;

      const newGrouped = { ...state.groupedTasks };
      
      // Remove from source
      newGrouped[sourceStatus] = newGrouped[sourceStatus].filter(
        (t) => t.id !== taskId
      );
      
      // Add to destination
      const updatedTask = { ...task, status: destStatus };
      newGrouped[destStatus] = [
        ...newGrouped[destStatus].slice(0, newIndex),
        updatedTask,
        ...newGrouped[destStatus].slice(newIndex),
      ];

      return { groupedTasks: newGrouped };
    });
  },

  // Delete task
  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await tasksAPI.delete(id);
      set((state) => {
        const task = state.tasks.find((t) => t.id === id);
        const newGrouped = { ...state.groupedTasks };
        
        if (task) {
          newGrouped[task.status] = newGrouped[task.status].filter(
            (t) => t.id !== id
          );
        }

        return {
          tasks: state.tasks.filter((t) => t.id !== id),
          groupedTasks: newGrouped,
          currentTask: state.currentTask?.id === id ? null : state.currentTask,
          loading: false,
        };
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la suppression';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Set current task
  setCurrentTask: (task) => set({ currentTask: task }),

  // Clear tasks
  clearTasks: () =>
    set({
      tasks: [],
      groupedTasks: { todo: [], in_progress: [], done: [] },
      currentTask: null,
    }),

  // Add task from socket event
  addTaskFromSocket: (task) => {
    set((state) => {
      if (state.tasks.find((t) => t.id === task.id)) return state;
      
      return {
        tasks: [...state.tasks, task],
        groupedTasks: {
          ...state.groupedTasks,
          [task.status]: [...state.groupedTasks[task.status], task],
        },
      };
    });
  },

  // Update task from socket event
  updateTaskFromSocket: (task) => {
    set((state) => {
      const oldTask = state.tasks.find((t) => t.id === task.id);
      const newGrouped = { ...state.groupedTasks };
      
      if (oldTask && oldTask.status !== task.status) {
        newGrouped[oldTask.status] = newGrouped[oldTask.status].filter(
          (t) => t.id !== task.id
        );
        newGrouped[task.status] = [...newGrouped[task.status], task];
      } else if (oldTask) {
        newGrouped[task.status] = newGrouped[task.status].map((t) =>
          t.id === task.id ? task : t
        );
      }

      return {
        tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
        groupedTasks: newGrouped,
      };
    });
  },

  // Remove task from socket event
  removeTaskFromSocket: (taskId) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      const newGrouped = { ...state.groupedTasks };
      
      if (task) {
        newGrouped[task.status] = newGrouped[task.status].filter(
          (t) => t.id !== taskId
        );
      }

      return {
        tasks: state.tasks.filter((t) => t.id !== taskId),
        groupedTasks: newGrouped,
      };
    });
  },

  clearError: () => set({ error: null }),
}));

export default useTaskStore;
