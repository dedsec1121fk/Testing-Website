/* Lightweight, robust interactions (nav toggle, search suggestions, lazy useful info)
   - defer this file
   - minimal globals
*/

(() => {
  'use strict';
  // shortcuts
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const navToggle = $('#nav-toggle');
  const primaryMenu = $('#primary-menu');
  const searchInput = $('#main-search-input');
  const suggestionsContainer = $('#search-suggestions-container');
  const mainSearchForm = $('#main-search-form');

  // ensure primaryMenu exists
  if (primaryMenu && primaryMenu.hasAttribute('hidden') === false) {
    // nothing; if no hidden attr, keep visible
  }

  // helper debounce
  function debounce(fn, wait = 180) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // nav toggle logic (accessible)
  function initNav() {
    if (!navToggle || !primaryMenu) return;
    // keep menu hidden by default on small screens (HTML has hidden)
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      if (primaryMenu.hasAttribute('hidden')) {
        primaryMenu.removeAttribute('hidden');
      } else {
        primaryMenu.setAttribute('hidden', '');
      }
    }, { passive: true });
    // close menu on outside click (mobile)
    document.addEventListener('click', (ev) => {
      if (!primaryMenu.contains(ev.target) && !navToggle.contains(ev.target) && window.innerWidth <= 880) {
        primaryMenu.setAttribute('hidden', '');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }, { passive: true });
  }

  // Search suggestions via Google JSONP (lightweight)
  function initSearch() {
    if (!searchInput || !suggestionsContainer || !mainSearchForm) return;
    window._dedsec_suggestion_cb = (data) => {
      suggestionsContainer.innerHTML = '';
      const list = Array.isArray(data && data[1]) ? data[1].slice(0,6) : [];
      if (!list.length) {
        suggestionsContainer.style.display = 'none';
        return;
      }
      list.forEach(s => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.tabIndex = 0;
        item.textContent = s;
        item.addEventListener('click', () => {
          searchInput.value = s;
          mainSearchForm.submit();
        });
        item.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') item.click();
        });
        suggestionsContainer.appendChild(item);
      });
      suggestionsContainer.style.display = 'block';
      suggestionsContainer.setAttribute('aria-hidden', 'false');
    };

    const fetchSuggestions = (q) => {
      const id = 'dedsec-google-suggest';
      const existing = document.getElementById(id);
      if (existing) existing.remove();
      if (!q || q.length < 1) {
        suggestionsContainer.style.display = 'none';
        suggestionsContainer.setAttribute('aria-hidden', 'true');
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(q)}&callback=_dedsec_suggestion_cb&hl=en`;
      script.onerror = () => { suggestionsContainer.style.display = 'none'; };
      document.head.appendChild(script);
    };

    searchInput.addEventListener('input', debounce((ev) => fetchSuggestions(ev.target.value.trim()), 220), { passive: true });

    document.addEventListener('click', (ev) => {
      if (!mainSearchForm.contains(ev.target)) {
        suggestionsContainer.style.display = 'none';
        suggestionsContainer.setAttribute('aria-hidden', 'true');
      }
    }, { passive: true });

    searchInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        suggestionsContainer.style.display = 'none';
        suggestionsContainer.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // lazy load useful info trigger (keeps heavy work out of critical path)
  function initLazyLoadTrigger() {
    const trigger = () => {
      // if user interaction we call existing window.dedsec.lazyLoadUsefulInfo if present
      if (window.dedsec && typeof window.dedsec.lazyLoadUsefulInfo === 'function') {
        window.dedsec.lazyLoadUsefulInfo().catch(() => {});
      }
      window.removeEventListener('scroll', trigger);
      document.removeEventListener('mousemove', trigger);
      document.removeEventListener('touchstart', trigger);
    };
    window.addEventListener('scroll', trigger, { passive: true });
    document.addEventListener('mousemove', trigger, { passive: true });
    document.addEventListener('touchstart', trigger, { passive: true });
  }

  // init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initNav();
      initSearch();
      initLazyLoadTrigger();
    }, { once: true });
  } else {
    initNav();
    initSearch();
    initLazyLoadTrigger();
  }

  // expose very small API
  window.dedsec = window.dedsec || {};
  window.dedsec._ui = {
    toggleMenu: () => {
      if (!primaryMenu) return;
      if (primaryMenu.hasAttribute('hidden')) primaryMenu.removeAttribute('hidden');
      else primaryMenu.setAttribute('hidden', '');
    }
  };
})();
