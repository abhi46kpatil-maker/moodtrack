// ui.js — Fullscreen slide-in navigation menu controller

const menu = document.getElementById('menu');
const menuOpenBtn = document.getElementById('menu-open');
const menuCloseBtn = document.getElementById('menu-close');
const menuBackdrop = document.getElementById('menu-backdrop');
const menuLinks = document.querySelectorAll('.menu__link');

function setMenu(open) {
  if (!menu) return;

  if (open) {
    menu.classList.add('is-open');
    if (menuOpenBtn) menuOpenBtn.setAttribute('aria-expanded', 'true');
    if (menuCloseBtn) menuCloseBtn.focus({ preventScroll: true });
  } else {
    menu.classList.remove('is-open');
    if (menuOpenBtn) {
      menuOpenBtn.setAttribute('aria-expanded', 'false');
      menuOpenBtn.focus({ preventScroll: true });
    }
  }
}

if (menuOpenBtn) {
  menuOpenBtn.addEventListener('click', () => setMenu(true));
}

if (menuCloseBtn) {
  menuCloseBtn.addEventListener('click', () => setMenu(false));
}

if (menuBackdrop) {
  menuBackdrop.addEventListener('click', () => setMenu(false));
}

menuLinks.forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) {
    setMenu(false);
  }
});
