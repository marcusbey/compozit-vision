import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../services/supabase'; // Now using real Supabase service
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Computed properties for useWizardValidation compatibility
  availableCredits: number;
  currentPlan: string;
  
  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<boolean>;
  register: (email: string, password: string) => Promise<void>;
  updateUserTokens: (newTokenCount: number) => Promise<void>;
  updateUserPlan: (newPlan: string, newTokens: number) => Promise<void>;
  consumeTokens: (amount: number) => void;
  consumeToken: () => Promise<boolean>;
  initializeAuth: () => (() => void) | undefined;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  // Computed properties
  get availableCredits() {
    const actualCredits = get().user?.nbToken || 0;
    
    // In development mode, provide test credits if user has 0 credits
    const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'development';
    if (isDevelopment && actualCredits === 0) {
      console.log('🟡 Providing test credits in development mode');
      return 999; // Unlimited credits for testing
    }
    
    return actualCredits;
  },
  get currentPlan() {
    return get().user?.currentPlan || 'free';
  },

  setUser: (user: User) => set({ 
    user, 
    isAuthenticated: true, 
    error: null 
  }),

  clearUser: () => set({ 
    user: null, 
    isAuthenticated: false, 
    error: null 
  }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Get user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.warn('Profile not found, creating default profile');
          // Create default profile if it doesn't exist
          const defaultProfile = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.email?.split('@')[0] || '',
            avatar_url: null,
            subscription_tier: 'free',
            subscription_status: 'active',
            credits_remaining: 3,
            preferences: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([defaultProfile]);

          if (insertError) {
            console.error('Error creating profile:', insertError);
            
            // Handle database setup issues during login
            if (insertError.message?.includes('relation "profiles" does not exist')) {
              throw new Error('Database setup incomplete. Please run the Supabase schema first.');
            }
          }

          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            fullName: defaultProfile.full_name,
            avatarUrl: null,
            preferences: {},
            nbToken: 3,
            currentPlan: 'free',
            createdAt: defaultProfile.created_at,
            updatedAt: defaultProfile.updated_at,
          };

          set({ user, isAuthenticated: true, error: null });
        } else {
          // Use existing profile
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            fullName: profile.full_name || '',
            avatarUrl: profile.avatar_url,
            preferences: profile.preferences || {},
            nbToken: profile.credits_remaining || 0,
            currentPlan: profile.subscription_tier || 'free',
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
          };

          set({ user, isAuthenticated: true, error: null });
        }
      }
      
      console.log('✅ Supabase login successful for:', email);
    } catch (error: any) {
      console.error('❌ Supabase login error:', error);
      set({ error: error.message || 'Email ou mot de passe incorrect' });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      set({ 
        user: null, 
        isAuthenticated: false,
        error: null 
      });
      
      // Clear local storage
      await AsyncStorage.multiRemove([
        'userAuthState',
        'userProfile',
        'userProjects',
        'userPreferences'
      ]);
      
      console.log('✅ Supabase logout successful');
      return true;
    } catch (error: any) {
      console.error('❌ Supabase logout error:', error);
      set({ error: error.message || 'Logout failed' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Fonction pour créer un compte
  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create user profile in Supabase
        const profile = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: email.split('@')[0],
          avatar_url: null,
          subscription_tier: 'free',
          subscription_status: 'active',
          credits_remaining: 3, // Free tier gets 3 credits
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profile]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          
          // Handle specific database errors
          if (profileError.message?.includes('relation "profiles" does not exist')) {
            throw new Error('Database setup incomplete. Please run the Supabase schema first.');
          } else if (profileError.message?.includes('duplicate key')) {
            throw new Error('User profile already exists');
          } else {
            throw new Error(`Failed to create user profile: ${profileError.message}`);
          }
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          fullName: profile.full_name,
          avatarUrl: null,
          preferences: {},
          nbToken: 3,
          currentPlan: 'free',
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        };

        set({ 
          user, 
          isAuthenticated: true,
          error: null 
        });

        console.log('✅ Supabase registration successful for:', email);
        console.log('✅ User profile created with', user.nbToken, 'credits');
      }
    } catch (error: any) {
      console.error('❌ Supabase registration error:', error);
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (error.message?.includes('already registered')) {
        errorMessage = 'Cette adresse email est déjà utilisée';
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Adresse email invalide';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fonction pour mettre à jour les tokens utilisateur
  updateUserTokens: async (newTokenCount: number) => {
    const user = get().user;
    if (!user) {
      set({ error: 'Utilisateur non connecté' });
      return;
    }

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          credits_remaining: newTokenCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      console.log('✅ Tokens updated in Supabase:', newTokenCount);

      // Update local state
      set((state) => ({
        user: state.user ? { ...state.user, nbToken: newTokenCount } : null
      }));
    } catch (error: any) {
      console.error('❌ Error updating tokens:', error);
      set({ error: error.message || 'Erreur lors de la mise à jour des tokens' });
    }
  },

  // Consommer des tokens
  consumeTokens: (amount: number) => {
    const { user } = get();
    if (!user || user.nbToken < amount) {
      set({ error: 'Tokens insuffisants' });
      return;
    }

    get().updateUserTokens(user.nbToken - amount);
  },

  // Mettre à jour le plan utilisateur
  updateUserPlan: async (newPlan: string, newTokens: number): Promise<void> => {
    const { user } = get();
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: newPlan,
          credits_remaining: newTokens,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      console.log('✅ User plan updated in Supabase:', newPlan);

      // Update local state
      set((state) => ({
        user: state.user ? { 
          ...state.user, 
          currentPlan: newPlan,
          nbToken: newTokens 
        } : null
      }));
    } catch (error: any) {
      console.error('❌ Error updating user plan:', error);
      set({ error: error.message || 'Erreur lors de la mise à jour du plan' });
      throw error;
    }
  },

  // Initialiser l'authentification et écouter les changements d'état
  initializeAuth: () => {
    set({ isLoading: true });
    
    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔥 Supabase Auth State Changed:', event, session?.user?.email || 'No user');
      
      if (session?.user) {
        // User is logged in - fetch their data
        try {
          console.log('📡 Fetching user profile from Supabase...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError || !profile) {
            console.warn('Profile not found, creating default profile');
            // Create default profile if it doesn't exist
            const defaultProfile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.email?.split('@')[0] || '',
              avatar_url: null,
              subscription_tier: 'free',
              subscription_status: 'active',
              credits_remaining: 3,
              preferences: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { error: insertError } = await supabase
              .from('profiles')
              .insert([defaultProfile]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              throw insertError;
            }

            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              fullName: defaultProfile.full_name,
              avatarUrl: null,
              preferences: {},
              nbToken: 3,
              currentPlan: 'free',
              createdAt: defaultProfile.created_at,
              updatedAt: defaultProfile.updated_at,
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
            console.log('✅ New user profile created:', user.email);
          } else {
            // Use existing profile
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              fullName: profile.full_name || '',
              avatarUrl: profile.avatar_url,
              preferences: profile.preferences || {},
              nbToken: profile.credits_remaining || 0,
              currentPlan: profile.subscription_tier || 'free',
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
            console.log('✅ User automatically logged in:', user.email);
          }
          
          // Save auth state to AsyncStorage for persistence
          await AsyncStorage.setItem('userAuthState', JSON.stringify({
            isAuthenticated: true,
            userId: session.user.id,
            email: session.user.email
          }));
          
        } catch (error: any) {
          console.error('❌ Error fetching user data:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: error.message || 'Erreur lors de la connexion automatique' 
          });
          
          // Clear auth state from AsyncStorage
          await AsyncStorage.removeItem('userAuthState');
        }
      } else {
        // User is not logged in
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false, 
          error: null 
        });
        console.log('❌ User not logged in');
        
        // Clear auth state from AsyncStorage
        await AsyncStorage.removeItem('userAuthState');
      }
    });

    // Return unsubscribe function
    return () => subscription.unsubscribe();
  },

  // Consommer un token pour une action IA
  consumeToken: async (): Promise<boolean> => {
    const { user } = get();
    if (!user || user.nbToken <= 0) {
      set({ error: 'Tokens insuffisants' });
      return false;
    }

    try {
      await get().updateUserTokens(user.nbToken - 1);
      return true;
    } catch (error) {
      console.error('Erreur lors de la consommation du token:', error);
      return false;
    }
  },
}));
