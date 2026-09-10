/**
 * ManuscriptReady — Client-side Landing Interactions (Phase 1.4)
 * Zero frameworks. Pure vanilla JS (~3 KB).
 * Keeps landing page lighthouse score at 100 with zero backend overhead.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Mobile Drawer Navigation
  // --------------------------------------------------------------------------
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.getElementById('mobile-drawer');

  function setDrawer(open) {
    if (!toggle || !drawer) return;
    toggle.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : ''; // lock scroll behind modal

    const target = open ? drawer.querySelector('a') : toggle;
    if (target) target.focus();
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', () => setDrawer(drawer.hidden));

    drawer.addEventListener('click', (e) => {
      if (e.target.closest('a')) setDrawer(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.hidden) {
        setDrawer(false);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 2. Sticky Header Scroll Shadow
  // --------------------------------------------------------------------------
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 3. Interactive Before / After Comparison Slider
  // --------------------------------------------------------------------------
  const sliders = document.querySelectorAll('.ba-slider');
  sliders.forEach((slider) => {
    const range = slider.querySelector('.ba-range');
    if (!range) return;

    const updateSlider = () => {
      slider.style.setProperty('--pos', `${range.value}%`);
    };

    range.addEventListener('input', updateSlider);
    range.addEventListener('change', updateSlider);
  });

  // --------------------------------------------------------------------------
  // 4. Serverless Contact Form Submission (Web3Forms / Fallback)
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const status = contactForm.querySelector('.form-status');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const honeypot = contactForm.querySelector('input[name="botcheck"]');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Silent discard for bots triggering honeypot
      if (honeypot && honeypot.checked) {
        if (status) {
          status.textContent = "Thanks — I'll reply within one business day.";
          status.dataset.type = 'success';
        }
        contactForm.reset();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      if (status) {
        status.textContent = 'Submitting your request…';
        status.dataset.type = 'info';
      }

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        if (status) {
          status.textContent = "Thanks — I'll reply within one business day with your quote.";
          status.dataset.type = 'success';
        }
        contactForm.reset();
      } catch (err) {
        // Fallback message for network or invalid access key during testing
        if (status) {
          status.textContent = 'Something went wrong — please email directly at contact@manuscriptready.com.';
          status.dataset.type = 'error';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
        }
      }
    });
  }
});
