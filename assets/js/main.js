/*!
 * Juni Ghost Theme — main.js
 */
(function () {
  'use strict';

  /* ---- Dark mode toggle ---- */
  var STORAGE_KEY = 'juni-theme';

  function getStoredTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setStoredTheme(val) {
    try { localStorage.setItem(STORAGE_KEY, val); } catch (e) {}
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('dark');
    }
  }

  // Apply on load before paint
  (function () {
    var stored = getStoredTheme();
    if (stored) applyTheme(stored);
  })();

  document.addEventListener('DOMContentLoaded', function () {

    /* ---- Dark mode button ---- */
    var toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var current = getStoredTheme();
        var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = current === 'dark' || (!current && systemDark);
        var next = isDark ? 'light' : 'dark';
        setStoredTheme(next);
        applyTheme(next);
      });
    }

    /* ---- Mobile nav ---- */
    var mobileToggle = document.querySelector('.mobile-menu-toggle');
    var mobileNav = document.getElementById('mobile-nav');

    if (mobileToggle && mobileNav) {
      mobileToggle.addEventListener('click', function () {
        var isOpen = mobileNav.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        mobileNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      });
    }

    /* ---- Today date in hero ---- */
    var dateEl = document.querySelector('.js-today-date');
    if (dateEl) {
      var d = new Date();
      var months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
      dateEl.textContent = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

    /* ---- Reading progress bar ---- */
    var progressBar = document.getElementById('reading-progress-bar');
    var postContent = document.getElementById('post-content');

    if (progressBar && postContent) {
      function updateProgress() {
        var rect = postContent.getBoundingClientRect();
        var start = rect.top + window.scrollY;
        var end = rect.bottom + window.scrollY;
        var scrolled = window.scrollY - start;
        var total = end - start - window.innerHeight;
        var pct = total > 0 ? Math.min(Math.max(scrolled / total * 100, 0), 100) : 0;
        progressBar.style.width = pct + '%';
      }

      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    }

    /* ---- Word count ---- */
    var wordCountEls = document.querySelectorAll('.js-word-count');
    if (wordCountEls.length && postContent) {
      var text = postContent.textContent || postContent.innerText || '';
      var words = text.trim().split(/\s+/).filter(Boolean).length;
      var formatted = words.toLocaleString();
      wordCountEls.forEach(function (el) {
        el.textContent = formatted + ' words';
      });
    }

    /* ---- Post card progress bars (reading time indicator) ---- */
    document.querySelectorAll('.post-card[data-reading-time]').forEach(function (card) {
      var mins = parseInt(card.getAttribute('data-reading-time'), 10) || 3;
      var pct = Math.min(Math.max(mins * 8, 10), 90);
      var fill = card.querySelector('.js-card-progress');
      if (fill) fill.style.width = pct + '%';
    });

    /* ---- Tag filter on homepage ---- */
    var filterContainer = document.getElementById('tag-filter');
    var postsGrid = document.getElementById('posts-grid');

    if (filterContainer && postsGrid) {
      filterContainer.addEventListener('click', function (e) {
        var btn = e.target.closest('.tag-filter__btn');
        if (!btn) return;

        filterContainer.querySelectorAll('.tag-filter__btn').forEach(function (b) {
          b.classList.remove('is-active');
        });
        btn.classList.add('is-active');

        var tag = btn.getAttribute('data-tag');
        postsGrid.querySelectorAll('.post-card').forEach(function (card) {
          if (tag === 'all') {
            card.style.display = '';
          } else {
            var tags = (card.getAttribute('data-tags') || '').split(' ');
            card.style.display = tags.indexOf(tag) !== -1 ? '' : 'none';
          }
        });
      });
    }

    /* ---- Table of contents ---- */
    var tocNav = document.querySelector('.js-toc-nav');
    var tocWrapper = document.querySelector('.js-post-toc');
    var content = document.getElementById('post-content');

    if (tocNav && tocWrapper && content) {
      var headings = content.querySelectorAll('h2, h3');

      if (headings.length >= 2) {
        tocWrapper.classList.add('has-headings');
        var fragment = document.createDocumentFragment();

        headings.forEach(function (h, i) {
          if (!h.id) h.id = 'section-' + i;
          var a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = h.textContent;
          if (h.tagName === 'H3') a.classList.add('toc-h3');

          a.addEventListener('click', function (e) {
            e.preventDefault();
            h.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });

          fragment.appendChild(a);
        });

        tocNav.appendChild(fragment);

        // Active link on scroll
        var tocLinks = tocNav.querySelectorAll('a');

        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              tocLinks.forEach(function (link) { link.classList.remove('is-active'); });
              var active = tocNav.querySelector('a[href="#' + entry.target.id + '"]');
              if (active) active.classList.add('is-active');
            }
          });
        }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });

        headings.forEach(function (h) { observer.observe(h); });
      }
    }

    /* ---- Smooth anchor scrolling (skip if browser handles it) ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

  });

})();
