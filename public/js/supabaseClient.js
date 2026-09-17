// Frontend Supabase Client Integration for CampusTech PEC-CS
let supabaseClient = null;
let supabaseConfig = {
  url: null,
  anonKey: null,
  isConfigured: false
};

// Initialize the Supabase browser client
export async function initSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  try {
    // Attempt to load runtime configuration from backend /api/config
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
        supabaseConfig.url = data.supabaseUrl;
        supabaseConfig.anonKey = data.supabaseAnonKey;
        supabaseConfig.isConfigured = true;
      }
    }
  } catch (err) {
    console.warn("[Frontend Supabase] Notice fetching /api/config:", err.message);
  }

  // Fallback to window or environment globals if injected
  if (!supabaseConfig.url && typeof window !== 'undefined') {
    if (window.__ENV__?.VITE_SUPABASE_URL && window.__ENV__?.VITE_SUPABASE_ANON_KEY) {
      supabaseConfig.url = window.__ENV__.VITE_SUPABASE_URL;
      supabaseConfig.anonKey = window.__ENV__.VITE_SUPABASE_ANON_KEY;
      supabaseConfig.isConfigured = true;
    }
  }

  // Create the Supabase client instance using global library or dynamic import
  if (supabaseConfig.isConfigured && supabaseConfig.url && supabaseConfig.anonKey) {
    try {
      if (typeof window !== 'undefined' && window.supabase?.createClient) {
        supabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            storageKey: 'campustech_supabase_auth_token'
          }
        });
        console.log(`[Frontend Supabase] Connected to Supabase at ${supabaseConfig.url}`);
      }
    } catch (err) {
      console.error("[Frontend Supabase] Error creating client:", err);
    }
  } else {
    console.log("[Frontend Supabase] Supabase credentials not yet supplied; continuing with Express API proxy.");
  }

  return supabaseClient;
}

export function getSupabaseClient() {
  return supabaseClient;
}

export function isSupabaseReady() {
  return !!supabaseClient;
}

export function getSupabaseConfig() {
  return { ...supabaseConfig };
}

// Authentication Helpers with Supabase Auth
export async function supabaseSignIn(email, password) {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("[Frontend Supabase Auth] Sign in notice:", err.message);
    throw err;
  }
}

export async function supabaseSignUp(email, password, metadata = {}) {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("[Frontend Supabase Auth] Sign up notice:", err.message);
    throw err;
  }
}

export async function supabaseSignOut() {
  if (!supabaseClient) return;
  try {
    await supabaseClient.auth.signOut();
  } catch (err) {
    console.warn("[Frontend Supabase Auth] Sign out notice:", err.message);
  }
}
