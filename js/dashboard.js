/**
 * ManuscriptReady — Client Portal Engine (Phase 1.5)
 * Route guards, manuscript dropzone with folder-prefix RLS, realtime tracker, and signed-URL downloads.
 */

import { supabase } from './supabase-client.js';

const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

const setStatus = (el, msg, type = 'info') => {
  if (!el) return;
  el.textContent = msg;
  el.dataset.type = type;
};

// ----------------------------------------------------------------------------
// 1. ROUTE GUARD & AUTH SESSION CHECK (Objective 5.2)
// ----------------------------------------------------------------------------
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  window.location.replace('/login');
  throw new Error('Not authenticated — redirecting to login');
}

const user = session.user;

// Listen for sign-out from other tabs or session invalidation
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    window.location.replace('/login');
  }
});

// Populate header user email and wire logout button
const emailEl = $('#user-email');
if (emailEl) emailEl.textContent = user.email;

$('#logout-btn')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.replace('/login');
});

// ----------------------------------------------------------------------------
// 2. DASHBOARD VIEW (dashboard.html) — Objective 5.4
// ----------------------------------------------------------------------------
const projectsTableWrap = $('#projects-table-wrap');
const projectsTbody = $('#projects-tbody');
const emptyState = $('#empty-state');

if (projectsTbody) {
  // Service and Status mappings matching DB CHECK constraints
  const SERVICE_LABELS = {
    formatting: 'APA 7 Formatting',
    editing: 'Comprehensive Editing',
    lit_review: 'Lit Review Structuring',
    coaching: 'Research Coaching',
    drafting: 'Developmental Drafting Support',
    data_analysis: 'Data Analysis (Quant & Qual)',
    figures: 'Figure, Table & Graph Development',
    defense_deck: 'Defense Presentation Deck',
  };

  const STATUS_META = {
    submitted: { label: 'Submitted', cls: 'badge-submitted' },
    under_review: { label: 'Under Review', cls: 'badge-review' },
    editing: { label: 'Editing in Progress', cls: 'badge-editing' },
    awaiting_payment: { label: 'Awaiting Payment', cls: 'badge-payment' },
    completed: { label: 'Completed', cls: 'badge-completed' },
  };

  // Fetch full name for welcome greeting
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const firstName = (profile?.full_name || '').trim().split(' ')[0] || 'scholar';
    const nameEl = $('#user-first-name');
    if (nameEl) nameEl.textContent = firstName;
  } catch (err) {
    console.warn('Could not fetch user profile:', err);
  }

  // Reveal protected portal area
  const portal = $('#portal');
  if (portal) portal.hidden = false;
  $('#portal-loading')?.remove();

  const usd = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);

  function toast(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', 'status');
    el.textContent = msg;
    document.body.append(el);
    setTimeout(() => el.remove(), 6000);
  }

  // Handle returning from Stripe checkout redirect
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    toast('Payment received — your status will update momentarily.', 'success');
    history.replaceState({}, '', '/dashboard');
  } else if (params.get('payment') === 'cancelled') {
    toast('Payment cancelled — your invoice remains open.', 'info');
    history.replaceState({}, '', '/dashboard');
  }

  let currentProjects = [];

  function rowHTML(p) {
    const meta = STATUS_META[p.status] ?? STATUS_META.submitted;
    const due = p.due_date
      ? new Date(p.due_date + 'T00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';

    let filesCell = `<span class="badge badge-submitted">⬆ Received</span>`;
    if (p.status === 'completed' && p.final_file_url) {
      filesCell = `<button class="btn btn-ghost" data-download="${esc(p.final_file_url)}" title="Download completed manuscript">⬇ Final .docx</button>`;
    } else if (p.status === 'awaiting_payment') {
      filesCell = p.paid
        ? `<span class="badge badge-editing">✓ Paid — in progress</span>`
        : `<button class="btn btn-primary" data-pay="${p.id}">Pay ${usd(p.amount_due)}</button>`;
    }

    return `<tr>
      <td data-label="Project"><strong>${esc(p.title)}</strong></td>
      <td data-label="Service">${SERVICE_LABELS[p.service_type] ?? esc(p.service_type)}</td>
      <td data-label="Due">${due}</td>
      <td data-label="Status"><span class="badge ${meta.cls}">${meta.label}</span></td>
      <td data-label="Files">${filesCell}</td>
    </tr>`;
  }

  function renderProjects(rows) {
    currentProjects = rows || [];
    if (!rows || rows.length === 0) {
      if (emptyState) emptyState.hidden = false;
      if (projectsTableWrap) projectsTableWrap.hidden = true;
      projectsTbody.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.hidden = true;
    if (projectsTableWrap) projectsTableWrap.hidden = false;
    projectsTbody.innerHTML = rows.map(rowHTML).join('');
  }

  async function loadProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      renderProjects(data ?? []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }

  // Initial load
  await loadProjects();

  // Realtime subscription (Objective 5.4 & 6.2)
  // Subscribes to changes on the projects table for the authenticated user
  supabase
    .channel(`projects-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        loadProjects();
      }
    )
    .subscribe();

  // Signed URL downloads for completed files (valid for 5 minutes)
  projectsTbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-download]');
    if (!btn) return;

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Preparing link…';

    try {
      const filePath = btn.dataset.download;
      const { data, error } = await supabase.storage
        .from('manuscripts')
        .createSignedUrl(filePath, 300); // 5 minutes valid

      if (error || !data?.signedUrl) {
        alert('Could not generate download link. Please contact support.');
        return;
      }

      window.open(data.signedUrl, '_blank');
    } catch (err) {
      alert('Download error. Please try again.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  // Pay Now Modal flow (Objective 6.2)
  const payModal = $('#pay-modal');
  let payTarget = null;

  projectsTbody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pay]');
    if (!btn) return;

    payTarget = currentProjects.find((p) => p.id === btn.dataset.pay);
    if (!payTarget) return;

    const projEl = $('#pay-project');
    const servEl = $('#pay-service');
    const amtEl = $('#pay-amount');

    if (projEl) projEl.textContent = payTarget.title;
    if (servEl) servEl.textContent = SERVICE_LABELS[payTarget.service_type] ?? '—';
    if (amtEl) amtEl.textContent = usd(payTarget.amount_due);

    if (payModal) payModal.showModal();
  });

  $('#pay-cancel')?.addEventListener('click', () => payModal?.close());
  payModal?.addEventListener('click', (e) => {
    if (e.target === payModal) payModal.close(); // Backdrop click dismissal
  });

  $('#pay-confirm')?.addEventListener('click', async () => {
    const confirmBtn = $('#pay-confirm');
    if (!confirmBtn || !payTarget) return;

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Redirecting to Stripe…';

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const token = currentSession?.access_token;

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId: payTarget.id }), // Server derives amount
      });

      const payload = await res.json();
      if (!res.ok || !payload.url) {
        throw new Error(payload.error || 'Checkout initiation failed');
      }

      window.location.href = payload.url;
    } catch (err) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Continue to Stripe';
      toast(err.message || 'Payment initiation failed', 'error');
    }
  });
}

// ----------------------------------------------------------------------------
// 3. NEW PROJECT UPLOAD ENGINE (new-project.html) — Objective 5.3
// ----------------------------------------------------------------------------
const newProjectForm = $('#new-project-form');
if (newProjectForm) {
  // Reveal protected portal area
  const portal = $('#portal');
  if (portal) portal.hidden = false;
  $('#portal-loading')?.remove();

  const zone = $('#dropzone');
  const input = $('#manuscriptFile');
  const dzStatus = $('#dz-status');
  const formStatus = $('#form-status');
  const ALLOWED_EXT = ['.doc', '.docx', '.pdf'];
  const MAX_MB = 25;

  const setZone = (state, msg = '') => {
    if (zone) zone.dataset.state = state;
    if (dzStatus && msg) dzStatus.textContent = msg;
  };

  // Dropzone click & keyboard trigger
  zone?.addEventListener('click', () => input?.click());
  zone?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input?.click();
    }
  });

  // Drag & drop handlers
  ['dragenter', 'dragover'].forEach((ev) => {
    zone?.addEventListener(ev, (e) => {
      e.preventDefault();
      setZone('dragover', 'Drop manuscript to upload');
    });
  });

  ['dragleave', 'drop'].forEach((ev) => {
    zone?.addEventListener(ev, () => {
      if (zone.dataset.state !== 'success') {
        setZone('idle');
      }
    });
  });

  zone?.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const dt = new DataTransfer();
    dt.items.add(file);
    if (input) input.files = dt.files;

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setZone('success', `✓ ${file.name} (${sizeMb} MB) attached`);
  });

  input?.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setZone('success', `✓ ${file.name} (${sizeMb} MB) attached`);
    }
  });

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return 'Unsupported file type. Please upload an editable .docx or reference .pdf.';
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return `File exceeds the ${MAX_MB} MB limit.`;
    }
    return null;
  };

  newProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = input?.files?.[0];

    if (!file) {
      setStatus(formStatus, 'Please attach your manuscript file.', 'error');
      setZone('error', 'Manuscript file required');
      return;
    }

    const validationProblem = validateFile(file);
    if (validationProblem) {
      setZone('error', validationProblem);
      setStatus(formStatus, validationProblem, 'error');
      return;
    }

    const submitBtn = newProjectForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setZone('uploading', `Uploading ${file.name}…`);
    setStatus(formStatus, 'Uploading manuscript and creating project…', 'info');

    try {
      // Deterministic UUID for storage folder prefix matching row ID
      const projectId = crypto.randomUUID();
      const safeName = file.name.replace(/[^\w.\- ]/g, '_');
      const storagePath = `${user.id}/${projectId}/${safeName}`;

      // Upload file to private manuscripts bucket
      const { error: uploadError } = await supabase.storage
        .from('manuscripts')
        .upload(storagePath, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        setZone('error', 'Upload failed: ' + uploadError.message);
        setStatus(formStatus, 'Upload failed: ' + uploadError.message, 'error');
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      // Insert row into projects table
      // (status is deliberately omitted so DB default 'submitted' applies)
      const { error: dbError } = await supabase.from('projects').insert({
        id: projectId,
        user_id: user.id,
        title: $('#np-title').value.trim(),
        service_type: $('#np-service').value,
        word_count: Number($('#np-words').value) || null,
        file_url: storagePath,
      });

      if (dbError) {
        console.error('Database insert error:', dbError);
        setStatus(
          formStatus,
          'File uploaded, but could not register project. Please contact support.',
          'error'
        );
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      // Success — redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Submission error:', err);
      setStatus(formStatus, 'An error occurred during submission. Please try again.', 'error');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
