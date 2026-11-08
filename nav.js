/* Progressive enhancement: every navigation link remains visible without JS. */
(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#main-nav');
  if (!header || !toggle || !nav) return;
  document.documentElement.classList.add('js');

  const currentPage = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a[href]').forEach((link) => {
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin) return;
    const targetPage = target.pathname.split('/').pop() || 'index.html';
    if (targetPage === currentPage) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  function setOpen(open, restoreFocus = false) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (restoreFocus) toggle.focus();
  }
  setOpen(false);
  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false, true);
    }
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  window.matchMedia('(min-width: 721px)').addEventListener('change', () => setOpen(false));
})();
