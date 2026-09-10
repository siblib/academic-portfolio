// Main script for landing page interactions
// Catch #2: Landing page never ships backend SDK to preserve lighthouse score and bundle size.

const toggle = document.querySelector('.nav-toggle');
const drawer = document.getElementById('mobile-drawer');

function setDrawer(open) {
  if (!toggle || !drawer) return;
  toggle.setAttribute('aria-expanded', String(open));
  drawer.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : ''; // lock scroll behind overlay
  const target = open ? drawer.querySelector('a') : toggle;
  if (target) target.focus();
}

if (toggle && drawer) {
  toggle.addEventListener('click', () => setDrawer(drawer.hidden));
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('a')) setDrawer(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) setDrawer(false);
  });
}

const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}
