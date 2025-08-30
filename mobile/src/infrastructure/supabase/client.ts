/**
 * Supabase Client Configuration
 * 
 * This file re-exports the supabase client from the main services directory
 * for infrastructure-based imports.
 */

// Re-export the main supabase client
export { supabase } from '../../services/supabase';

// Re-export types from supabase service
// Note: Database type not available in current service implementation