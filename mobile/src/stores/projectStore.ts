import { create } from 'zustand';
import { Project } from '../types';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  subscription: any | null;
  
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
  subscribeToProjects: () => Promise<void>;
  unsubscribeFromProjects: () => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  subscription: null,

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
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        set({ error: 'Utilisateur non connecté', isLoading: false });
        return;
      }

      // Delete from Supabase
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erreur Supabase lors de la suppression:', error);
        set({ error: 'Erreur lors de la suppression du projet', isLoading: false });
        return;
      }

      const state = get();
      const updatedProjects = state.projects.filter(p => p.id !== id);
      
      // Update AsyncStorage as backup
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
    set({ isLoading: true, error: null });
    try {
      // Get current user from userStore (which handles both real and mock users)
      const { useUserStore } = await import('./userStore');
      const currentUser = useUserStore.getState().user;
      
      if (!currentUser) {
        set({ error: 'Utilisateur non connecté', isLoading: false });
        return;
      }

      // For development mode with mock users, load from AsyncStorage only
      if (__DEV__ && currentUser.id.includes('dev-user')) {
        console.log('🚀 Development mode: Loading projects from local storage');
        
        const storedProjects = await AsyncStorage.getItem('projects');
        let projects: Project[] = [];
        
        if (storedProjects) {
          const allProjects = JSON.parse(storedProjects);
          projects = allProjects.filter((p: Project) => p.userId === currentUser.id);
        }
        
        set({ projects, isLoading: false });
        console.log('✅ Development projects loaded from local storage:', projects.length);
        return;
      }

      // Production mode - fetch from Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        set({ error: 'Utilisateur non connecté', isLoading: false });
        return;
      }

      // Fetch from Supabase
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Erreur Supabase lors de la récupération:', error);
        // Fallback to AsyncStorage
        const storedProjects = await AsyncStorage.getItem('projects');
        let fallbackProjects: Project[] = [];
        
        if (storedProjects) {
          const allProjects = JSON.parse(storedProjects);
          fallbackProjects = allProjects.filter((p: Project) => p.userId === user.id);
        }
        
        set({ projects: fallbackProjects, isLoading: false });
        return;
      }

      // Transform Supabase data to match our interface
      const transformedProjects: Project[] = projects?.map(p => ({
        id: p.id,
        userId: p.user_id,
        name: p.name,
        description: p.description || '',
        status: p.status as Project['status'],
        metadata: p.room_type ? { 
          room_type: p.room_type,
          style_preferences: p.style_preferences,
          budget_min: p.budget_min,
          budget_max: p.budget_max,
          original_images: p.original_images 
        } : {},
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })) || [];
      
      // Update AsyncStorage as backup
      await AsyncStorage.setItem('projects', JSON.stringify(transformedProjects));
      
      set({ projects: transformedProjects, isLoading: false });
      console.log('Projets récupérés depuis Supabase:', transformedProjects.length);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      set({ error: 'Erreur lors du chargement des projets', isLoading: false });
    }
  },

  createProject: async (name: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Get current user from userStore (which handles both real and mock users)
      const { useUserStore } = await import('./userStore');
      const currentUser = useUserStore.getState().user;
      
      if (!currentUser) {
        set({ error: 'Utilisateur non connecté', isLoading: false });
        return;
      }

      const now = new Date().toISOString();
      const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // For development mode with mock users, store locally
      if (__DEV__ && currentUser.id.includes('dev-user')) {
        console.log('🚀 Development mode: Creating project locally');
        
        const newProject: Project = {
          id: projectId,
          userId: currentUser.id,
          name: name.trim(),
          description: description?.trim() || '',
          status: 'draft' as const,
          metadata: {},
          createdAt: now,
          updatedAt: now,
        };

        // Update AsyncStorage
        const storedProjects = await AsyncStorage.getItem('projects');
        const existingProjects = storedProjects ? JSON.parse(storedProjects) : [];
        const updatedProjects = [...existingProjects, newProject];
        await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
        
        get().addProject(newProject);
        set({ isLoading: false });
        console.log('✅ Development project created locally:', newProject.name);
        return;
      }

      // Production mode - use real Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        set({ error: 'Utilisateur non connecté', isLoading: false });
        return;
      }

      const projectData = {
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || '',
        status: 'draft' as const,
        is_public: false,
        style_preferences: [],
        original_images: [],
        created_at: now,
        updated_at: now,
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur Supabase lors de la création:', error);
        set({ error: 'Erreur lors de la création du projet', isLoading: false });
        return;
      }

      // Transform Supabase response to our interface
      const newProject: Project = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description || '',
        status: data.status as Project['status'],
        metadata: {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Update AsyncStorage as backup
      const storedProjects = await AsyncStorage.getItem('projects');
      const existingProjects = storedProjects ? JSON.parse(storedProjects) : [];
      const updatedProjects = [...existingProjects, newProject];
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      get().addProject(newProject);
      set({ isLoading: false });
      console.log('Projet créé avec succès dans Supabase:', newProject.name);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      set({ error: 'Erreur lors de la création du projet', isLoading: false });
    }
  },

  subscribeToProjects: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Cannot subscribe: user not authenticated');
        return;
      }

      // Unsubscribe from any existing subscription
      const state = get();
      if (state.subscription) {
        state.subscription.unsubscribe();
      }

      // Create new subscription for user's projects
      const subscription = supabase
        .channel(`projects:${user.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'projects', 
            filter: `user_id=eq.${user.id}` 
          },
          (payload) => {
            console.log('Real-time project update:', payload);
            
            switch (payload.eventType) {
              case 'INSERT':
                const newProject = {
                  id: payload.new.id,
                  userId: payload.new.user_id,
                  name: payload.new.name,
                  description: payload.new.description || '',
                  status: payload.new.status,
                  metadata: {
                    room_type: payload.new.room_type,
                    style_preferences: payload.new.style_preferences,
                    budget_min: payload.new.budget_min,
                    budget_max: payload.new.budget_max,
                    original_images: payload.new.original_images
                  },
                  createdAt: payload.new.created_at,
                  updatedAt: payload.new.updated_at,
                };
                get().addProject(newProject);
                break;
              
              case 'UPDATE':
                const updatedProject = {
                  userId: payload.new.user_id,
                  name: payload.new.name,
                  description: payload.new.description || '',
                  status: payload.new.status,
                  metadata: {
                    room_type: payload.new.room_type,
                    style_preferences: payload.new.style_preferences,
                    budget_min: payload.new.budget_min,
                    budget_max: payload.new.budget_max,
                    original_images: payload.new.original_images
                  },
                  updatedAt: payload.new.updated_at,
                };
                get().updateProject(payload.new.id, updatedProject);
                break;
              
              case 'DELETE':
                const state = get();
                set({
                  projects: state.projects.filter(p => p.id !== payload.old.id),
                  currentProject: state.currentProject?.id === payload.old.id ? null : state.currentProject
                });
                break;
            }
          }
        )
        .subscribe();

      set({ subscription });
      console.log('Subscribed to real-time project updates');
    } catch (error) {
      console.error('Error setting up project subscription:', error);
    }
  },

  unsubscribeFromProjects: () => {
    const state = get();
    if (state.subscription) {
      state.subscription.unsubscribe();
      set({ subscription: null });
      console.log('Unsubscribed from project updates');
    }
  },

  reset: () => {
    const state = get();
    if (state.subscription) {
      state.subscription.unsubscribe();
    }
    set({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,
      subscription: null,
    });
  },
}));
