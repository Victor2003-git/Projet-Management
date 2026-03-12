import { create } from 'zustand';
import { projectsAPI } from '../services/api';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  pagination: null,
  loading: false,
  error: null,

  // Fetch all projects
  fetchProjects: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await projectsAPI.getAll(params);
      set({
        projects: response.data.projects,
        pagination: response.data.pagination,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement des projets',
        loading: false,
      });
    }
  },

  // Fetch single project
  fetchProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await projectsAPI.getById(id);
      set({ currentProject: response.data.project, loading: false });
      return response.data.project;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement du projet',
        loading: false,
      });
      throw error;
    }
  },

  // Create project
  createProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await projectsAPI.create(data);
      const newProject = response.data.project;
      set((state) => ({
        projects: [newProject, ...state.projects],
        loading: false,
      }));
      return { success: true, project: newProject };
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la création';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Update project
  updateProject: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await projectsAPI.update(id, data);
      const updatedProject = response.data.project;
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === id ? updatedProject : state.currentProject,
        loading: false,
      }));
      return { success: true, project: updatedProject };
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la mise à jour';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Delete project
  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await projectsAPI.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la suppression';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Add member to project
  addMember: async (projectId, userId, role) => {
    try {
      const response = await projectsAPI.addMember(projectId, { userId, role });
      if (get().currentProject?.id === projectId) {
        set((state) => ({
          currentProject: {
            ...state.currentProject,
            members: response.data.members,
          },
        }));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Remove member from project
  removeMember: async (projectId, userId) => {
    try {
      await projectsAPI.removeMember(projectId, userId);
      if (get().currentProject?.id === projectId) {
        set((state) => ({
          currentProject: {
            ...state.currentProject,
            members: state.currentProject.members.filter((m) => m.id !== userId),
          },
        }));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Clear current project
  clearCurrentProject: () => set({ currentProject: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useProjectStore;
