import { create } from 'zustand';
import { Design, Product } from '../types';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DesignState {
  designs: Design[];
  currentDesign: Design | null;
  suggestedProducts: Product[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  
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
}

export const useDesignStore = create<DesignState>((set, get) => ({
  designs: [],
  currentDesign: null,
  suggestedProducts: [],
  isLoading: false,
  isGenerating: false,
  error: null,

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
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'Utilisateur non connecté' });
      return;
    }

    set({ isGenerating: true, error: null });
    try {
      const newDesign: Design = {
        id: Date.now().toString(),
        projectId,
        originalImageUrl: imageUri,
        style,
        roomType: roomType || 'salon',
        status: 'processing' as const,
        createdAt: new Date().toISOString(),
      };

      // Sauvegarder dans AsyncStorage
      const storedDesigns = await AsyncStorage.getItem('designs');
      const existingDesigns = storedDesigns ? JSON.parse(storedDesigns) : [];
      const updatedDesigns = [...existingDesigns, newDesign];
      await AsyncStorage.setItem('designs', JSON.stringify(updatedDesigns));
      
      get().addDesign(newDesign);
      console.log('Design créé avec succès, génération en cours...');
      
      // TODO: Ici on appellerait l'API de génération IA
      // Pour l'instant, on simule juste la création
      
    } catch (error) {
      console.error('Erreur lors de la génération du design:', error);
      set({ error: 'Erreur lors de la génération du design' });
    } finally {
      set({ isGenerating: false });
    }
  },

  fetchDesigns: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const storedDesigns = await AsyncStorage.getItem('designs');
      let designs: Design[] = [];
      
      if (storedDesigns) {
        const allDesigns = JSON.parse(storedDesigns);
        // Filtrer les designs du projet
        designs = allDesigns.filter((d: Design) => d.projectId === projectId);
        // Trier par date de création (plus récent en premier)
        designs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      set({ designs, isLoading: false });
      console.log('Designs récupérés:', designs.length);
    } catch (error) {
      console.error('Erreur lors de la récupération des designs:', error);
      set({ error: 'Erreur lors du chargement des designs', isLoading: false });
    }
  },
}));
