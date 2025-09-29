/* Snapshot sharing: create a present-only, read-only link with embedded assets.
   Works fully offline via localStorage. */
(function () {
  const LS_SNAPSHOT = (id) => `foundry-snapshot-${id}`;

  function uid() {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return Array.from(a).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  async function createSnapshot() {
    try {
      if (typeof window.embedAllImagesInState === 'function') {
        await window.embedAllImagesInState();
      }
      const payload = {
        formData: window.formData || {},
        images: window.images || {},
        createdAt: new Date().toISOString(),
        rev: (window.__REV__ || 0)
      };
      return payload;
    } catch (e) {
      console.error('Snapshot failed', e);
      return null;
    }
  }

  async function createShareLink(role = 'client') {
    const id = uid();
    const snap = await createSnapshot();
    if (!snap) return null;

    try {
      localStorage.setItem(LS_SNAPSHOT(id), JSON.stringify(snap));
    } catch (e) {
      alert('Unable to store snapshot locally. Reduce image sizes and try again.');
      return null;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'present');
    url.searchParams.set('role', role);
    url.hash = `share=${id}`;
    return url.toString();
  }

  // Expose to UI (admin-only ideally)
  window.createShareLink = createShareLink;

  // Loader: if a share hash is present, load snapshot and go preview
  (function loadSharedIfPresent() {
    try {
      const hash = new URL(window.location.href).hash || '';
      const m = hash.match(/share=([0-9a-f]{32})/i);
      if (!m) return;
      const id = m[1];
      const raw = localStorage.getItem(LS_SNAPSHOT(id));
      if (!raw) return;

      const snap = JSON.parse(raw);
      if (snap.formData) window.formData = snap.formData;
      if (snap.images) window.images = snap.images;
      if (typeof window.renderApp === 'function') {
        // Show preview immediately
        window.currentView = 'preview';
        window.renderApp();
      }
    } catch (e) {
      console.warn('Shared snapshot load failed', e);
    }
  })();
})();