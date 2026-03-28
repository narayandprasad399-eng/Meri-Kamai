import { createClient } from '@supabase/supabase-js';

// .env file se safely keys ko nikalna (Vite mein import.meta.env use hota hai)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Agar keys miss ho jayein toh error show karega taaki debugging aasan ho
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Check your .env file.");
}

// Supabase client create karna jo poore app me use hoga
export const supabase = createClient(supabaseUrl, supabaseAnonKey);