import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to generate user ID from PIN (using hash)
export async function generateUserId(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Set user context for RLS (Row Level Security)
export async function setUserContext(userId: string) {
    const { error } = await supabase.rpc('set_config', {
        setting: 'app.user_id',
        value: userId
    });

    if (error) {
        console.error('Error setting user context:', error);
    }
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey);
}
