(() => {
  // Guarded Admin Loader (simple, robust)
  const injectAdmin = () => {
    if (document.querySelector('script[data-admin-addon]')) return;
    const s = document.createElement('script');
    s.src = './admin-addon.js';
    s.setAttribute('data-admin-addon', 'true');
    s.onload = () => console.log('Admin UI loaded');
    s.onerror = () => console.warn('Admin UI failed to load');
    document.head.appendChild(s);
  };

  const load = () => {
    // Wait for role/guard to initialize
    if (!window.roleMode || !window.proposalGuard || !window.proposalGuard.getCurrentPermissions) {
      return setTimeout(load, 100);
    }
    // Destructure permission per spec
    const { viewAdmin } = window.proposalGuard.getCurrentPermissions();
    if (viewAdmin) {
      injectAdmin();
    } else {
      console.log('Admin UI not loaded (insufficient permissions)');
    }
  };

  // Kick once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once: true });
  } else {
    load();
  }

  // Re-check on role/mode/guard changes
  window.addEventListener('roleChanged', load);
  window.addEventListener('modeChanged', load);
  window.addEventListener('guardInitialized', load);
})();