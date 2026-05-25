/**
 * SkillVault Auth Navigation — Clerk production integration
 * Include this script on every static HTML page after the Clerk CDN.
 * NOTE: Clerk auto-initializes from the data-clerk-publishable-key script tag.
 * Do NOT call window.Clerk.load() — it will hang.
 */
(function() {
  'use strict';

  function getReturnUrl() {
    return encodeURIComponent(window.location.href);
  }

  function renderNav() {
    if (!window.Clerk || !window.Clerk.mountSignIn) return;
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    const user = window.Clerk.user;

    if (user) {
      navAuth.innerHTML = `
        <div class="auth-user">
          <span class="auth-email">${escapeHtml(user.primaryEmailAddress?.emailAddress || user.firstName || 'User')}</span>
          <button class="auth-signout" id="auth-signout-btn">Sign Out</button>
        </div>
      `;
      document.getElementById('auth-signout-btn')?.addEventListener('click', () => {
        window.Clerk.signOut();
      });
    } else {
      const returnUrl = getReturnUrl();
      navAuth.innerHTML = `
        <a href="/login.html?return_url=${returnUrl}" class="nav-link auth-link">Login</a>
        <a href="/signup.html?return_url=${returnUrl}" class="nav-btn auth-btn">Sign Up</a>
      `;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function init() {
    if (window.Clerk && window.Clerk.mountSignIn) {
      renderNav();
      if (window.Clerk.addListener) {
        window.Clerk.addListener(() => renderNav());
      }
    } else {
      setTimeout(init, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
