(() => {
  'use strict';

  let isInitialized = false;

  const url = new URL(window.location.href);
  const urlRole = url.searchParams.get('role');
  const urlMode = url.searchParams.get('mode');
  const forceAdminParam = url.searchParams.get('forceAdmin') === 'true';
  const forceAdmin = forceAdminParam || urlRole === 'admin';

  // Normalize role/mode if forcing admin via URL
  const ensureAdminState = () => {
    try {
      if (forceAdmin) {
        localStorage.setItem('foundry-user-role', 'admin');
        localStorage.setItem('foundry-view-mode', 'edit');
        // Best-effort to sync current role/mode APIs if available
        if (window.roleMode?.switchRole) window.roleMode.switchRole('admin');
        if (window.roleMode?.switchMode) window.roleMode.switchMode('edit');
      }
    } catch {}
  };

  const injectAdmin = () => {
    if (document.querySelector('script[data-admin-addon]') ||
        document.querySelector('script[src*="admin-addon.js"]')) return;
    const s = document.createElement('script');
    s.src = './admin-addon.js?v=202510010425';
    s.setAttribute('data-admin-addon', 'loaded');
    s.onload = () => console.log('Admin UI loaded');
    s.onerror = () => console.warn('Failed to load admin UI');
    document.head.appendChild(s);
  };

  const canViewAdmin = () => {
    if (forceAdmin) return true;
    const perms = window.proposalGuard?.getCurrentPermissions?.();
    return !!perms?.viewAdmin;
  };

  const load = () => {
    // Delay until role/guard exist (unless forceAdmin)
    if (!forceAdmin && (!window.roleMode || !window.proposalGuard || !window.proposalGuard.getCurrentPermissions)) {
      if (!isInitialized) setTimeout(load, 100);
      return;
    }

    ensureAdminState();

    if (canViewAdmin()) {
      injectAdmin();
      isInitialized = true;  // Mark as initialized to stop retry loop
    } else {
      console.log('Admin UI not loaded (insufficient permissions)');
      isInitialized = true;  // Mark as initialized even when not loading admin
    }
  };

  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once: true });
  } else {
    load();
  }

  // Re-check on role/mode/guard events
  window.addEventListener('roleModeInitialized', load);
  window.addEventListener('guardInitialized', load);
  window.addEventListener('roleChanged', load);
  window.addEventListener('modeChanged', load);

  // Fallback retry loop (in case events don't fire due to extensions)
  let retries = 0;
  const tryLater = () => {
    if (retries++ > 40 || isInitialized) return; // ~4s max or already initialized
    load();
    setTimeout(tryLater, 100);
  };
  tryLater();
})();