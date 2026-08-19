/* =========================================================
   ABINZER CHURCH — script.js
   Mobile menu, header state, scroll-reveal, full gallery lightbox
   (keyboard + swipe navigable), contact form validation, back-to-top,
   dynamic year, broken-image fallback.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
 try {

  /* ---------- Dynamic year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 500) backToTop.classList.add('show');
    else backToTop.classList.remove('show');
  }
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Header state on scroll ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    toggleBackToTop();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const toggleIcon = document.getElementById('toggleIcon');

  const closeMenu = () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    toggleIcon.setAttribute('href', '#icon-menu');
    document.body.style.overflow = '';
  };
  const openMenu = () => {
    mainNav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    toggleIcon.setAttribute('href', '#icon-close');
    document.body.style.overflow = 'hidden';
  };

  navToggle.addEventListener('click', () => {
    mainNav.classList.contains('open') ? closeMenu() : openMenu();
  });

  /* Close mobile menu + smooth scroll on nav link click */
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          closeMenu();
          const offset = 84;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------- Active nav link on scroll (scrollspy) ---------- */
  const sections = document.querySelectorAll('main .section, .hero');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(sec => spyObserver.observe(sec));

  /* ---------- Scroll-reveal animations ---------- */
  const animatedEls = document.querySelectorAll('[data-animate]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), (i % 6) * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  animatedEls.forEach(el => revealObserver.observe(el));

  /* Safety net: guarantee content is never stuck invisible.
     If the observer misses anything (slow load, unusual viewport,
     odd embedding context) force it visible after a short delay. */
  setTimeout(() => {
    animatedEls.forEach(el => el.classList.add('in-view'));
  }, 1500);

  /* ---------- Gallery lightbox: full-screen, keyboard + swipe navigable ---------- */
  const galleryGrid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');

  if (galleryGrid && lightbox) {
    const items = Array.from(galleryGrid.querySelectorAll('.g-item'));
    const lbImage = document.getElementById('lightboxImage');
    const lbCaption = document.getElementById('lightboxCaption');
    const lbCounter = document.getElementById('lightboxCounter');
    const lbClose = document.getElementById('lightboxClose');
    const lbPrev = document.getElementById('lightboxPrev');
    const lbNext = document.getElementById('lightboxNext');
    let current = 0;
    let lastFocused = null;

    const renderSlide = (index) => {
      const item = items[index];
      const full = item.getAttribute('data-full') || item.querySelector('img').src;
      const caption = item.getAttribute('data-caption') || '';
      lbImage.src = full;
      lbImage.alt = caption;
      lbCaption.textContent = caption;
      lbCounter.textContent = `${index + 1} / ${items.length}`;
    };

    const openLightbox = (index) => {
      current = index;
      lastFocused = document.activeElement;
      renderSlide(current);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      lbClose.focus();
      document.addEventListener('keydown', onKeydown);
    };

    const closeLightbox = () => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    };

    const showPrev = () => { current = (current - 1 + items.length) % items.length; renderSlide(current); };
    const showNext = () => { current = (current + 1) % items.length; renderSlide(current); };

    function onKeydown(e) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
      else if (e.key === 'Tab') {
        /* simple focus trap between the lightbox controls */
        const focusables = [lbPrev, lbNext, lbClose];
        const idx = focusables.indexOf(document.activeElement);
        e.preventDefault();
        if (e.shiftKey) focusables[(idx <= 0 ? focusables.length - 1 : idx - 1)].focus();
        else focusables[(idx + 1) % focusables.length].focus();
      }
    }

    items.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', showPrev);
    lbNext.addEventListener('click', showNext);
    lightbox.querySelectorAll('[data-lightbox-close]').forEach(el => el.addEventListener('click', closeLightbox));

    /* Touch swipe support */
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) > 40) delta > 0 ? showPrev() : showNext();
    }, { passive: true });
  }

  /* ---------- Sermon category filter ---------- */
  const sermonFilters = document.querySelectorAll('.sermon-filter');
  const sermonCards = document.querySelectorAll('.sermon-card');
  const sermonEmpty = document.getElementById('sermonEmpty');

  sermonFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      sermonFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      let visibleCount = 0;

      sermonCards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.hidden = !match;
        if (match) visibleCount++;
      });

      if (sermonEmpty) sermonEmpty.hidden = visibleCount > 0;
    });
  });

  /* ---------- Broken image fallback ---------- */
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.closest('picture, .g-item')?.classList.add('img-fallback');
      img.style.background = 'linear-gradient(150deg, var(--navy, #0B1F3A), var(--navy-soft, #16294a))';
      img.alt = img.alt || 'Suura hin argamne';
    }, { once: true });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const fieldConfigs = [
    {
      input: () => document.getElementById('cf-name'),
      errorEl: () => document.getElementById('err-name'),
      validate: (val) => val.trim().length >= 2,
      message: 'Maaloo maqaa keessan guutuu galchaa (yoo xiqqaate qubee 2).'
    },
    {
      input: () => document.getElementById('cf-email'),
      errorEl: () => document.getElementById('err-email'),
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
      message: 'Maaloo teessoo imeelii sirrii galchaa.'
    },
    {
      input: () => document.getElementById('cf-message'),
      errorEl: () => document.getElementById('err-message'),
      validate: (val) => val.trim().length >= 10,
      message: 'Maaloo ergaa yoo xiqqaate qubee 10 ta\'u barreessaa.'
    }
  ];

  function validateField(config) {
    const input = config.input();
    const errorEl = config.errorEl();
    const isValid = config.validate(input.value);
    const field = input.closest('.form-field');

    if (!isValid) {
      field.classList.add('error');
      errorEl.textContent = config.message;
    } else {
      field.classList.remove('error');
      errorEl.textContent = '';
    }
    return isValid;
  }

  if (form) {
    const submitBtn = document.getElementById('cfSubmitBtn');
    const formError = document.getElementById('formError');

    fieldConfigs.forEach(config => {
      const input = config.input();
      input.addEventListener('blur', () => validateField(config));
      input.addEventListener('input', () => {
        if (input.closest('.form-field').classList.contains('error')) {
          validateField(config);
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      formSuccess.classList.remove('show');
      if (formError) formError.style.display = 'none';

      let allValid = true;
      fieldConfigs.forEach(config => {
        if (!validateField(config)) allValid = false;
      });

      if (!allValid) {
        const firstError = form.querySelector('.form-field.error input, .form-field.error textarea');
        if (firstError) firstError.focus();
        return;
      }

      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Ergaa erguu jira...';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });

        if (response.ok) {
          formSuccess.classList.add('show');
          form.reset();
          setTimeout(() => formSuccess.classList.remove('show'), 6000);
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        if (formError) formError.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }

 } catch (err) {
   /* If anything above throws, don't let the page stay blank —
      reveal all animated content and log the error for debugging. */
   console.error('Abinzer Church script error:', err);
   document.querySelectorAll('[data-animate]').forEach(el => el.classList.add('in-view'));
 }

});
