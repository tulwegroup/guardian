import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config';

let supabaseInstance: SupabaseClient | null = null;

export const initSupabase = () => {
  // Strictly use Config File (Hardcoded)
  if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
      if (!supabaseInstance) {
        supabaseInstance = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      }
      return supabaseInstance;
    } catch (e) {
      console.warn("Supabase config init failed:", e);
    }
  }
  return null;
};

// Initialize immediately
initSupabase();

export const getSupabase = () => {
  if (!supabaseInstance) {
    return initSupabase();
  }
  return supabaseInstance;
};

// These functions are no longer needed for hardcoded config but kept empty to prevent import errors in Admin
export const saveSupabaseConfig = (url: string, key: string) => {};
export const clearSupabaseConfig = () => {};
export const getStoredConfig = () => {
  return { url: SUPABASE_CONFIG.url, key: SUPABASE_CONFIG.anonKey };
};