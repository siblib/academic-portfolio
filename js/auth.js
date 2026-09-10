/**
 * ManuscriptReady — Client Auth Engine (Phase 1.5)
 * Connects to Supabase Auth with atomic profile population via handle_new_user trigger.
 */

import { supabase } from './supabase-client.js';

const $ = (sel) => document.querySelector(sel);
const setStatus = (el, msg, type = 'info') => {
  if (!el) return;
  el.textContent = msg;
  el.dataset.type = type;
};

// Check if user is already authenticated
async function checkCurrentSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      window.location.replace('/dashboard');
    }
  } catch (err) {
    console.error('Session check error:', err);
  }
}

// ----------------------------------------------------------------------------
// 1. LOGIN FORM HANDLER
// ----------------------------------------------------------------------------
const loginForm = $('#login-form');
if (loginForm) {
  checkCurrentSession();

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('#login-status');
    const btn = loginForm.querySelector('button[type="submit"]');
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;

    if (!email || !password) {
      setStatus(status, 'Please enter both email and password.', 'error');
      return;
    }

    btn.disabled = true;
    setStatus(status, 'Signing in…', 'info');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus(status, error.message, 'error');
        btn.disabled = false;
        return;
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setStatus(status, 'An unexpected error occurred. Please try again.', 'error');
      btn.disabled = false;
    }
  });
}

// ----------------------------------------------------------------------------
// 2. REGISTER FORM HANDLER
// ----------------------------------------------------------------------------
const registerForm = $('#register-form');
if (registerForm) {
  checkCurrentSession();

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('#register-status');
    const btn = registerForm.querySelector('button[type="submit"]');
    const fullName = $('#reg-name').value.trim();
    const email = $('#reg-email').value.trim();
    const password = $('#reg-password').value;

    if (!fullName || !email || !password) {
      setStatus(status, 'Please fill in all required fields.', 'error');
      return;
    }

    if (password.length < 6) {
      setStatus(status, 'Password must be at least 6 characters.', 'error');
      return;
    }

    btn.disabled = true;
    setStatus(status, 'Creating your account…', 'info');

    try {
      // options.data.full_name lands in raw_user_meta_data for the Phase 3 DB trigger
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setStatus(status, error.message, 'error');
        btn.disabled = false;
        return;
      }

      if (data.session) {
        // Direct session created (email confirmation turned off in Supabase)
        window.location.href = '/dashboard';
      } else {
        // Email confirmation is required
        setStatus(
          status,
          'Account created! Please check your email inbox to confirm your address, then log in.',
          'success'
        );
        registerForm.reset();
      }
    } catch (err) {
      setStatus(status, 'Registration failed. Please try again.', 'error');
      btn.disabled = false;
    }
  });
}

// ----------------------------------------------------------------------------
// 3. LOGOUT HANDLER
// ----------------------------------------------------------------------------
$('#logout-btn')?.addEventListener('click', async () => {
  try {
    await supabase.auth.signOut();
    window.location.replace('/login');
  } catch (err) {
    window.location.replace('/login');
  }
});
