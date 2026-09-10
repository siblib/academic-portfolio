import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Single authenticated entry point for the browser
// The anon key is safe for client-side usage — Row Level Security (RLS) is the security layer.
export const supabase = createClient(
  'https://dxkibctgiixzcxaskigy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4a2liY3RnaWl4emN4YXNraWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjMzNjUsImV4cCI6MjEwNDU5OTM2NX0.ZyGpFjFf4iOG9XVxBzkKMpf16vEmWa5SibomxIzwCqU'
);
