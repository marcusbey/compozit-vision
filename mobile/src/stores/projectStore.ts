import { create } from 'zustand';
import { Project } from '../types';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  setProjects: (projects: Project[]) => set({ projects, error: null }),

  setCurrentProject: (currentProject: Project | null) => set({ currentProject }),

  addProject: (project: Project) => set((state) => ({
    projects: [...state.projects, project]
  })),

  updateProject: (id: string, updates: Partial<Project>) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ),
    currentProject: state.currentProject?.id === id 
      ? { ...state.currentProject, ...updates }
      : state.currentProject
  })),

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const updatedProjects = state.projects.filter(p => p.id !== id);
      
      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      set({
        projects: updatedProjects,
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false
      });
      console.log('Projet supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      set({ error: 'Erreur lors de la suppression du projet', isLoading: false });
    }
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  fetchProjects: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Utilisateur non connecté' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const storedProjects = await AsyncStorage.getItem('projects');
      let projects: Project[] = [];
      
      if (storedProjects) {
        const allProjects = JSON.parse(storedProjects);
        // Filtrer les projets de l'utilisateur actuel
        projects = allProjects.filter((p: Project) => p.userId === user.uid);
      }
      
      set({ projects, isLoading: false });
      console.log('Projets récupérés:', projects.length);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      set({ error: 'Erreur lors du chargement des projets', isLoading: false });
    }
  },

  createProject: async (name: string, description?: string) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Utilisateur non connecté' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const newProject: Project = {
        id: Date.now().toString(), // ID simple pour AsyncStorage
        userId: user.uid,
        name: name.trim(),
        description: description?.trim() || '',
        status: 'draft' as const,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Récupérer les projets existants
      const storedProjects = await AsyncStorage.getItem('projects');
      const existingProjects = storedProjects ? JSON.parse(storedProjects) : [];
      
      // Ajouter le nouveau projet
      const updatedProjects = [...existingProjects, newProject];
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      get().addProject(newProject);
      set({ isLoading: false });
      console.log('Projet créé avec succès:', newProject.name);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      set({ error: 'Erreur lors de la création du projet', isLoading: false });
    }
  },
}));
