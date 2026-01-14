import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey);
}

// Sign up with email and password (no email confirmation required)
export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: undefined, // No email confirmation
        }
    });

    if (error) throw error;
    return data;
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

// Sign out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Get current user
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Get current session
export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Listen to auth changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
}
