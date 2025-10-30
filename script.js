/* Modern, compact, performance-minded JS
   - defer this file in HTML
   - minimal globals, lazy index & fetch
   - accessible nav toggle, search suggestions with debounce
   - lazy-load heavy sections on user interaction
*/

(() => {
  'use strict';

  // Short helpers
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // State
  let currentLanguage = localStorage.getItem('language') || 'en';
  const navToggle = $('#nav-toggle');
  const primaryMenu = $('#primary-menu');
  const searchInput = $('#main-search-input');
  const suggestionsContainer = $('#search-suggestions-container');
  const mainSearchForm = $('#main-search-form');

  // Debounce utility
  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // NAV TOGGLE (accessible)
  function initNav() {
    if (!navToggle || !primaryMenu) return;
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      if (expanded) primaryMenu.hidden = true;
      else primaryMenu.hidden = false;
    }, { passive: true });
  }

  // Search suggestions (Google suggest via JSONP)
  function initSearchSuggestions() {
    if (!searchInput || !suggestionsContainer || !mainSearchForm) return;

    window.handleGoogleSuggestions = (data) => {
      suggestionsContainer.innerHTML = '';
      const list = Array.isArray(data && data[1]) ? data[1].slice(0,5) : [];
      if (list.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
      }
      list.forEach(s => {
        const el = document.createElement('div');
        el.className = 'search-result-item';
        el.textContent = s;
        el.tabIndex = 0;
        el.addEventListener('click', () => {
          searchInput.value = s;
          mainSearchForm.submit();
        });
        el.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { el.click(); }
        });
        suggestionsContainer.appendChild(el);
      });
      suggestionsContainer.style.display = 'block';
    };

    const fetchSuggestions = (q) => {
      const id = 'jsonp-google-suggestions';
      const existing = document.getElementById(id);
      if (existing) existing.remove();
      if (!q || q.length < 1) {
        suggestionsContainer.style.display = 'none';
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(q)}&hl=${currentLanguage}&callback=handleGoogleSuggestions`;
      script.onerror = () => { suggestionsContainer.style.display = 'none'; };
      document.head.appendChild(script);
    };

    const debounced = debounce((e) => fetchSuggestions(e.target.value.trim()), 220);
    searchInput.addEventListener('input', debounced, { passive: true });
    document.addEventListener('click', (e) => {
      if (!mainSearchForm.contains(e.target)) suggestionsContainer.style.display = 'none';
    }, { passive: true });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') suggestionsContainer.style.display = 'none';
    });
  }

  // Language management (simple)
  function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    // update attributes (data-en/data-gr) on elements
    $$('[data-en]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
      // prefer updating text nodes only
      if (el.children.length === 0) el.textContent = text;
      else {
        // update simple spans inside
        const s = el.querySelector('span');
        if (s) s.textContent = text;
      }
    });
  }

  // Lazy initialization for heavy features (useful articles indexing)
  function lazyLoadUsefulInfo() {
    // Only load after user interacts or scrolls (performance)
    if (lazyLoadUsefulInfo.loaded) return;
    lazyLoadUsefulInfo.loaded = true;

    // fetch useful info index in background (non-blocking)
    importUsefulInfo().catch(err => console.warn('Useful info load failed', err));
  }

  async function importUsefulInfo() {
    // This function intentionally keeps work off critical path.
    // It fetches a list of files and indexes them for quick search.
    const GITHUB_API_URL = 'https://api.github.com/repos/dedsec1121fk/dedsec1121fk.github.io/contents/Useful_Information';
    try {
      const r = await fetch(GITHUB_API_URL);
      if (!r.ok) return;
      const files = await r.json();
      // Minimal UI update: show there are articles (not full indexing here)
      const nav = document.querySelector('.features');
      if (nav && files && files.length) {
        // add a small badge to the Articles card
        const card = nav.querySelector('article.card:nth-child(3)');
        if (card && !card.querySelector('.badge')) {
          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = `${files.length} articles`;
          badge.style.cssText = 'display:inline-block;margin-left:8px;padding:4px 8px;border-radius:999px;background:rgba(0,0,0,0.2);font-size:0.8rem';
          card.querySelector('h2').appendChild(badge);
        }
      }
      // detailed indexing can be done on demand (user search)
    } catch (e) {
      // fail silently to avoid blocking
      console.debug('useful info error', e);
    }
  }

  // Startup
  function init() {
    initNav();
    initSearchSuggestions();
    applyLanguage(currentLanguage);

    // Lazy-load heavy stuff when user scrolls or interacts
    const oneTime = () => {
      lazyLoadUsefulInfo();
      window.removeEventListener('scroll', oneTime);
      document.removeEventListener('mousemove', oneTime);
      document.removeEventListener('touchstart', oneTime);
    };
    window.addEventListener('scroll', oneTime, { passive: true });
    document.addEventListener('mousemove', oneTime, { passive: true });
    document.addEventListener('touchstart', oneTime, { passive: true });
  }

  // Wait for DOMContentLoaded if not already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else init();

  // Expose minimal utilities for the page (no large globals)
  window.dedsec = {
    setLanguage: (lang) => applyLanguage(lang),
    lazyLoadUsefulInfo
  };
})();
