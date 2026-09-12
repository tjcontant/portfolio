// Dark mode toggle for cookbook pages. Pairs with the inline bootstrap
// script in each page's <head>, which sets data-theme="dark" on <html>
// before first paint (to avoid a flash of the wrong theme) based on the
// same 'cookbook-theme' localStorage key this file reads and writes.
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('darkModeToggle');
  if (!toggle) return;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function updateToggle() {
    const dark = isDark();
    toggle.textContent = dark ? 'Light' : 'Dark';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  toggle.addEventListener('click', function () {
    const dark = !isDark();
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    try {
      localStorage.setItem('cookbook-theme', dark ? 'dark' : 'light');
    } catch (e) {
      // localStorage unavailable (private browsing, etc.) - theme just won't persist
    }
    updateToggle();
  });

  updateToggle();
});
