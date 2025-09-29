/* Role + Mode guard and admin shielding.
   - role: admin | agent | client (default admin for internal)
   - mode: edit | present (default edit)
   Use URLs like:
   ?role=client&mode=present  or  ?role=agent&mode=present
*/
(function () {
  try {
    const q = new URLSearchParams(location.search);
    const LS_ROLE = 'foundry-role';
    const LS_MODE = 'foundry-mode';

    // Persistable params
    const roleFromUrl = q.get('role');
    const modeFromUrl = q.get('mode');

    if (roleFromUrl) localStorage.setItem(LS_ROLE, roleFromUrl);
    if (modeFromUrl) localStorage.setItem(LS_MODE, modeFromUrl);

    const role = (roleFromUrl || localStorage.getItem(LS_ROLE) || 'admin').toLowerCase();
    const mode = (modeFromUrl || localStorage.getItem(LS_MODE) || 'edit').toLowerCase();

    document.documentElement.setAttribute('data-role', role);
    document.documentElement.setAttribute('data-mode', mode);

    // Never load admin add-on for non-admin roles (defensive in case of static tag)
    const stripAdminScripts = () => {
      document.querySelectorAll('script[src*="admin-addon.js"]').forEach(s => s.remove());
    };
    stripAdminScripts();

    // Defensive: hide any admin widgets that get injected later
    const hideAdminNodes = (root) => {
      root.querySelectorAll('.admin-only, [data-admin], [id*="admin"], [class*="admin"]').forEach(n => {
        n.style.display = 'none';
        n.setAttribute('aria-hidden', 'true');
      });
      // And hide generic app chrome in present mode
      if (mode === 'present') {
        root.querySelectorAll('.print-hidden, .sticky, .no-present, .app-toolbar').forEach(n => {
          n.style.display = 'none';
          n.setAttribute('aria-hidden', 'true');
        });
      }
    };
    hideAdminNodes(document);

    const mo = new MutationObserver(muts => {
      muts.forEach(m => {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach(node => {
            if (node.nodeType === 1) hideAdminNodes(node);
          });
        }
      });
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });

    // Expose for any conditional loaders later
    window.__USER_ROLE__ = role;
    window.__PRESENTATION_MODE__ = mode === 'present';
  } catch (e) {
    console.error('role-mode guard failed', e);
  }
})();