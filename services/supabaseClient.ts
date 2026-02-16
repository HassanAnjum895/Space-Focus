
import { createClient } from '@supabase/supabase-js';

// In a real production Next.js app, these should be process.env.NEXT_PUBLIC_SUPABASE_URL
// For this environment, we are using the provided credentials directly.
const SUPABASE_URL = 'https://whalghxnwamjzmeuznff.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYWxnaHhud2FtanptZXV6bmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjIyNjEsImV4cCI6MjA4NjgzODI2MX0.Erl57FKhHFNVXNRBIBz1TULJqs0gJmxbrBf3PHw3a90';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
