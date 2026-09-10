// lib/server-supabase.js
const { createClient } = require('@supabase/supabase-js');

// Privileged client — bypasses RLS. Server-only, never bundled for browsers.
const admin = createClient(
  process.env.SUPABASE_URL || 'https://dxkibctgiixzcxaskigy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Validates a caller's JWT against the Supabase auth server. Returns user or null.
async function verifyUser(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  try {
    const { data, error } = await admin.auth.getUser(token);
    return error ? null : data.user;
  } catch (err) {
    return null;
  }
}

module.exports = { admin, verifyUser };
