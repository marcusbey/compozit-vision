import { create } from 'zustand';
import { User } from '../types';
import { auth, firestore, isFirestoreAvailable } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      let user: User;
      
      if (isFirestoreAvailable()) {
        try {
          // Récupérer les données utilisateur depuis Firestore
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // Utilisateur existant - récupérer depuis Firestore
            user = {
              id: firebaseUser.uid,
              ...userDoc.data()
            } as User;
            console.log('Données utilisateur récupérées depuis Firestore');
          } else {
            // Pas de données Firestore, créer un utilisateur par défaut
            user = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || email.split('@')[0],
              avatarUrl: firebaseUser.photoURL || undefined,
              preferences: {},
              nbToken: 10,
              currentPlan: 'free',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        } catch (error) {
          console.warn('Erreur Firestore, fallback vers AsyncStorage:', error);
          // Fallback vers AsyncStorage
          const userData = await AsyncStorage.getItem(`user_${firebaseUser.uid}`);
          user = userData ? JSON.parse(userData) : {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || email.split('@')[0],
            avatarUrl: firebaseUser.photoURL || undefined,
            preferences: {},
            nbToken: 10,
            currentPlan: 'free',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        // Firestore non disponible, utiliser AsyncStorage
        const userData = await AsyncStorage.getItem(`user_${firebaseUser.uid}`);
        user = userData ? JSON.parse(userData) : {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || email.split('@')[0],
          avatarUrl: firebaseUser.photoURL || undefined,
          preferences: {},
          nbToken: 10,
          currentPlan: 'free',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      
      set({ 
        user, 
        isAuthenticated: true,
        error: null 
      });
      
      console.log('Connexion Firebase réussie pour:', email);
    } catch (error: any) {
      console.error('Erreur de connexion Firebase:', error);
      set({ error: 'Email ou mot de passe incorrect' });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut(auth);
      set({ 
        user: null, 
        isAuthenticated: false,
        error: null 
      });
      console.log('Firebase logout successful');
      
      // Navigate to Auth screen after logout
      // This will be handled by the navigation logic
      return true;
    } catch (error: any) {
      console.error('Firebase logout error:', error);
      set({ error: 'Logout failed' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Fonction pour créer un compte
  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        fullName: email.split('@')[0],
        avatarUrl: firebaseUser.photoURL || null,
        preferences: {},
        nbToken: 50, // Tokens de départ pour nouveaux utilisateurs
        currentPlan: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Sauvegarder les données utilisateur dans Firestore uniquement
      await setDoc(doc(firestore, 'users', firebaseUser.uid), {
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        preferences: user.preferences,
        nbToken: user.nbToken,
        currentPlan: user.currentPlan,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      console.log('Données utilisateur sauvegardées dans Firestore');
      
      set({ 
        user, 
        isAuthenticated: true,
        error: null 
      });
      
      console.log('Inscription Firebase réussie pour:', email);
      console.log('Données utilisateur sauvegardées dans Firestore avec', user.nbToken, 'tokens');
    } catch (error: any) {
      console.error('Erreur d\'inscription Firebase:', error);
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cette adresse email est déjà utilisée';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
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
      // Mettre à jour dans Firestore uniquement
      await updateDoc(doc(firestore, 'users', user.id), {
        nbToken: newTokenCount,
        updatedAt: new Date().toISOString(),
      });
      console.log('Tokens mis à jour dans Firestore:', newTokenCount);

      // Mettre à jour le state local
      set((state) => ({
        user: state.user ? { ...state.user, nbToken: newTokenCount } : null
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des tokens:', error);
      set({ error: 'Erreur lors de la mise à jour des tokens' });
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
      // Mettre à jour dans Firestore
      await updateDoc(doc(firestore, 'users', user.id), {
        currentPlan: newPlan,
        nbToken: newTokens,
        updatedAt: new Date().toISOString(),
      });
      console.log('Plan utilisateur mis à jour dans Firestore:', newPlan);

      // Mettre à jour le state local
      set((state) => ({
        user: state.user ? { 
          ...state.user, 
          currentPlan: newPlan,
          nbToken: newTokens 
        } : null
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du plan:', error);
      set({ error: 'Erreur lors de la mise à jour du plan' });
      throw error;
    }
  },

  // Initialiser l'authentification et écouter les changements d'état
  initializeAuth: () => {
    set({ isLoading: true });
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Firebase Auth State Changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        // Utilisateur connecté - récupérer ses données
        try {
          console.log('📡 Fetching user data from Firestore...');
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: userData.fullName || firebaseUser.email?.split('@')[0] || '',
              avatarUrl: userData.avatarUrl || null,
              preferences: userData.preferences || {},
              nbToken: userData.nbToken || 50,
              currentPlan: userData.currentPlan || 'free',
              createdAt: userData.createdAt || new Date().toISOString(),
              updatedAt: userData.updatedAt || new Date().toISOString(),
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
            console.log('✅ User automatically logged in:', user.email);
            
            // Save auth state to AsyncStorage for persistence
            await AsyncStorage.setItem('userAuthState', JSON.stringify({
              isAuthenticated: true,
              userId: user.id,
              email: user.email
            }));
            
          } else {
            // Document utilisateur n'existe pas, créer un nouveau
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.email?.split('@')[0] || '',
              avatarUrl: null,
              preferences: {},
              nbToken: 50,
              currentPlan: 'free',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(firestore, 'users', firebaseUser.uid), {
              email: user.email,
              fullName: user.fullName,
              avatarUrl: user.avatarUrl,
              preferences: user.preferences,
              nbToken: user.nbToken,
              currentPlan: user.currentPlan,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            });

            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
            console.log('✅ New user created automatically:', user.email);
            
            // Save auth state to AsyncStorage
            await AsyncStorage.setItem('userAuthState', JSON.stringify({
              isAuthenticated: true,
              userId: user.id,
              email: user.email
            }));
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: 'Erreur lors de la connexion automatique' 
          });
          
          // Clear auth state from AsyncStorage
          await AsyncStorage.removeItem('userAuthState');
        }
      } else {
        // Utilisateur non connecté
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

    // Retourner la fonction de désabonnement (optionnel)
    return unsubscribe;
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
