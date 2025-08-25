import { create } from 'zustand';
import { Design, Product } from '../types';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DesignState {
  designs: Design[];
  currentDesign: Design | null;
  suggestedProducts: Product[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  subscription: any | null;
  
  // Actions
  setDesigns: (designs: Design[]) => void;
  setCurrentDesign: (design: Design | null) => void;
  addDesign: (design: Design) => void;
  updateDesign: (id: string, updates: Partial<Design>) => void;
  setSuggestedProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  generateDesign: (projectId: string, imageUri: string, style: string, roomType?: string) => Promise<void>;
  fetchDesigns: (projectId: string) => Promise<void>;
  subscribeToDesigns: (projectId: string) => Promise<void>;
  unsubscribeFromDesigns: () => void;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  designs: [],
  currentDesign: null,
  suggestedProducts: [],
  isLoading: false,
  isGenerating: false,
  error: null,
  subscription: null,

  setDesigns: (designs: Design[]) => set({ designs, error: null }),

  setCurrentDesign: (currentDesign: Design | null) => set({ currentDesign }),

  addDesign: (design: Design) => set((state) => ({
    designs: [...state.designs, design]
  })),

  updateDesign: (id: string, updates: Partial<Design>) => set((state) => ({
    designs: state.designs.map(d => 
      d.id === id ? { ...d, ...updates } : d
    ),
    currentDesign: state.currentDesign?.id === id 
      ? { ...state.currentDesign, ...updates }
      : state.currentDesign
  })),

  setSuggestedProducts: (suggestedProducts: Product[]) => set({ suggestedProducts }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setGenerating: (isGenerating: boolean) => set({ isGenerating }),

  setError: (error: string | null) => set({ error }),

  generateDesign: async (projectId: string, imageUri: string, style: string, roomType?: string) => {
    set({ isGenerating: true, error: null });
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        set({ error: 'Utilisateur non connecté', isGenerating: false });
        return;
      }

      const now = new Date().toISOString();
      const designData = {
        project_id: projectId,
        name: `Design - ${style}`,
        style,
        ai_prompt: `Generate a ${style} style design for a ${roomType || 'living room'}`,
        products: [],
        is_favorite: false,
        created_at: now,
        metadata: {
          original_image_url: imageUri,
          room_type: roomType || 'salon',
          status: 'processing'
        },
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('designs')
        .insert(designData)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur Supabase lors de la création du design:', error);
        set({ error: 'Erreur lors de la génération du design', isGenerating: false });
        return;
      }

      // Transform Supabase response to our interface
      const newDesign: Design = {
        id: data.id,
        projectId: data.project_id,
        originalImageUrl: imageUri,
        enhancedImageUrl: data.generated_image_url || undefined,
        style: data.style,
        roomType: roomType || 'salon',
        dimensions: data.metadata?.dimensions,
        aiMetadata: data.metadata,
        status: 'processing' as const,
        createdAt: data.created_at,
      };

      // Update AsyncStorage as backup
      const storedDesigns = await AsyncStorage.getItem('designs');
      const existingDesigns = storedDesigns ? JSON.parse(storedDesigns) : [];
      const updatedDesigns = [...existingDesigns, newDesign];
      await AsyncStorage.setItem('designs', JSON.stringify(updatedDesigns));
      
      get().addDesign(newDesign);
      console.log('Design créé avec succès dans Supabase, génération en cours...');
      
      // TODO: Ici on appellerait l'API de génération IA
      // Pour l'instant, on simule juste la création
      
    } catch (error) {
      console.error('Erreur lors de la génération du design:', error);
      set({ error: 'Erreur lors de la génération du design', isGenerating: false });
    } finally {
      set({ isGenerating: false });
    }
  },

  fetchDesigns: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch from Supabase
      const { data: designs, error } = await supabase
        .from('designs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur Supabase lors de la récupération des designs:', error);
        // Fallback to AsyncStorage
        const storedDesigns = await AsyncStorage.getItem('designs');
        let fallbackDesigns: Design[] = [];
        
        if (storedDesigns) {
          const allDesigns = JSON.parse(storedDesigns);
          fallbackDesigns = allDesigns.filter((d: Design) => d.projectId === projectId);
          fallbackDesigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        
        set({ designs: fallbackDesigns, isLoading: false });
        return;
      }

      // Transform Supabase data to match our interface
      const transformedDesigns: Design[] = designs?.map(d => ({
        id: d.id,
        projectId: d.project_id,
        originalImageUrl: d.metadata?.original_image_url || '',
        enhancedImageUrl: d.generated_image_url,
        style: d.style,
        roomType: d.metadata?.room_type,
        dimensions: d.metadata?.dimensions,
        aiMetadata: d.metadata,
        status: d.metadata?.status || 'completed' as const,
        createdAt: d.created_at,
      })) || [];
      
      // Update AsyncStorage as backup
      await AsyncStorage.setItem('designs', JSON.stringify(transformedDesigns));
      
      set({ designs: transformedDesigns, isLoading: false });
      console.log('Designs récupérés depuis Supabase:', transformedDesigns.length);
    } catch (error) {
      console.error('Erreur lors de la récupération des designs:', error);
      set({ error: 'Erreur lors du chargement des designs', isLoading: false });
    }
  },

  subscribeToDesigns: async (projectId: string) => {
    try {
      // Unsubscribe from any existing subscription
      const state = get();
      if (state.subscription) {
        state.subscription.unsubscribe();
      }

      // Create new subscription for project designs
      const subscription = supabase
        .channel(`designs:${projectId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'designs', 
            filter: `project_id=eq.${projectId}` 
          },
          (payload) => {
            console.log('Real-time design update:', payload);
            
            switch (payload.eventType) {
              case 'INSERT':
                const newDesign = {
                  id: payload.new.id,
                  projectId: payload.new.project_id,
                  originalImageUrl: payload.new.metadata?.original_image_url || '',
                  enhancedImageUrl: payload.new.generated_image_url,
                  style: payload.new.style,
                  roomType: payload.new.metadata?.room_type,
                  dimensions: payload.new.metadata?.dimensions,
                  aiMetadata: payload.new.metadata,
                  status: payload.new.metadata?.status || 'completed' as const,
                  createdAt: payload.new.created_at,
                };
                get().addDesign(newDesign);
                break;
              
              case 'UPDATE':
                const updatedDesign = {
                  originalImageUrl: payload.new.metadata?.original_image_url || '',
                  enhancedImageUrl: payload.new.generated_image_url,
                  style: payload.new.style,
                  roomType: payload.new.metadata?.room_type,
                  dimensions: payload.new.metadata?.dimensions,
                  aiMetadata: payload.new.metadata,
                  status: payload.new.metadata?.status || 'completed' as const,
                };
                get().updateDesign(payload.new.id, updatedDesign);
                break;
              
              case 'DELETE':
                const currentState = get();
                set({
                  designs: currentState.designs.filter(d => d.id !== payload.old.id),
                  currentDesign: currentState.currentDesign?.id === payload.old.id ? null : currentState.currentDesign
                });
                break;
            }
          }
        )
        .subscribe();

      set({ subscription });
      console.log('Subscribed to real-time design updates for project:', projectId);
    } catch (error) {
      console.error('Error setting up design subscription:', error);
    }
  },

  unsubscribeFromDesigns: () => {
    const state = get();
    if (state.subscription) {
      state.subscription.unsubscribe();
      set({ subscription: null });
      console.log('Unsubscribed from design updates');
    }
  },
}));
