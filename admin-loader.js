(() => {
  'use strict';
  
  // Guarded Admin Loader (simple, robust)
  let isInitialized = false;
  
  const injectAdmin = () => {
    if (document.querySelector('script[data-admin-addon="loaded"]')) return;
    const s = document.createElement('script');
    s.src = './admin-addon.js';
    s.setAttribute('data-admin-addon', 'loaded');
    s.onload = () => console.log('Admin UI loaded');
    s.onerror = () => console.warn('Failed to load admin UI');
    document.head.appendChild(s);
  };

  const load = () => {
    // Wait for role/guard to initialize
    if (!window.roleMode || !window.proposalGuard) {
      if (!isInitialized) {
        setTimeout(load, 100);
      }
      return;
    }
    
    // Check if admin is already loaded to prevent duplicates
    if (document.querySelector('script[data-admin-addon="loaded"]')) {
      return;
    }
    
    // Destructure permission per spec
    const { viewAdmin } = window.proposalGuard.getCurrentPermissions();
    if (viewAdmin) {
      injectAdmin();
    } else {
      console.log('Admin UI not loaded (insufficient permissions)');
    }
  };

  // Wait for role system to be fully initialized before first check
  window.addEventListener('roleModeInitialized', () => {
    isInitialized = true;
    load();
  }, { once: true });

  // Re-check on role/mode/guard changes
  window.addEventListener('roleChanged', load);
  window.addEventListener('modeChanged', load);
  window.addEventListener('guardInitialized', load);
  
  // Fallback: try loading after a delay if events don't fire
  setTimeout(() => {
    if (!isInitialized) {
      load();
    }
  }, 1000);
})();