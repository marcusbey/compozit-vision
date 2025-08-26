// Mock Supabase service for testing - allows app to start without dependencies
console.log('🔧 Using mock Supabase service');

// Mock Supabase auth
const mockAuth = {
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    console.log('🔧 Mock login:', email);
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email: email,
        }
      },
      error: null
    };
  },

  signUp: async ({ email, password }: { email: string; password: string }) => {
    console.log('🔧 Mock signup:', email);
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email: email,
        }
      },
      error: null
    };
  },

  signOut: async () => {
    console.log('🔧 Mock logout');
    return { error: null };
  },

  onAuthStateChange: (callback: Function) => {
    console.log('🔧 Mock auth state listener setup');
    // Simulate initial auth state
    setTimeout(() => {
      callback('INITIAL_SESSION', null);
    }, 100);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => console.log('🔧 Mock auth listener unsubscribed')
        }
      }
    };
  }
};

// Mock Supabase client
export const supabase = {
  auth: mockAuth,
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          console.log(`🔧 Mock query: ${table}.${columns} WHERE ${column} = ${value}`);
          return {
            data: {
              id: 'mock-profile-id',
              email: 'mock@example.com',
              full_name: 'Mock User',
              subscription_tier: 'free',
              credits_remaining: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null
          };
        }
      })
    }),
    insert: (data: any[]) => ({
      select: () => ({
        single: async () => {
          console.log(`🔧 Mock insert into ${table}:`, data);
          return { data: data[0], error: null };
        }
      })
    }),
    update: (updates: any) => ({
      eq: (column: string, value: any) => ({
        async: async () => {
          console.log(`🔧 Mock update ${table} SET`, updates, `WHERE ${column} = ${value}`);
          return { error: null };
        }
      })
    })
  })
};

// Mock interfaces
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'business';
  subscription_status: string;
  stripe_customer_id?: string;
  credits_remaining: number;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Export other mock interfaces as needed
export const supabaseHelpers = {
  getProfile: async (userId: string) => null,
  updateProfile: async (userId: string, updates: any) => null,
  getUserProjects: async (userId: string) => [],
  createProject: async (projectData: any) => null,
  searchProducts: async (query: string, filters?: any) => [],
  subscribeToProject: (projectId: string, callback: Function) => ({ unsubscribe: () => {} }),
  subscribeToDesigns: (projectId: string, callback: Function) => ({ unsubscribe: () => {} }),
  trackEvent: async (userId: string, eventType: string, eventData: Record<string, any>) => {}
};

export default supabase;