/* Load Admin config (from localStorage 'foundry-admin-config'), apply brand tokens,
   and expose a safe, merged config for the app to use. */
(function () {
  const DEFAULT_CONFIG = {
    version: 1,
    brand: { tokens: {}, logo: "" },
    legal: { terms: "", warranty: "", validityDays: 30, depositPercent: 50, companyEmail: "info@foundrycabinetco.com" },
    absolutes: { requiredFields: ["clientName","projectName","price","timeline"], requiredSections: ["description"], requireAltText: true, maxImageMB: 4 },
    templates: {},
    sharing: { expiryDays: 14, allowDownload: true },
    features: { presentationMode: true, signatureDraw: true, imageCompression: true }
  };

  function readAdminConfig() {
    try {
      const raw = localStorage.getItem('foundry-admin-config');
      if (!raw) return DEFAULT_CONFIG;
      const parsed = JSON.parse(raw);
      return deepMerge(DEFAULT_CONFIG, parsed);
    } catch (e) {
      console.warn('Admin config invalid, using defaults', e);
      return DEFAULT_CONFIG;
    }
  }

  function deepMerge(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) return b.slice();
    if (typeof a === 'object' && typeof b === 'object' && a && b) {
      const out = { ...a };
      Object.keys(b).forEach(k => { out[k] = k in a ? deepMerge(a[k], b[k]) : b[k]; });
      return out;
    }
    return b ?? a;
  }

  function applyBrandTokens(tokens) {
    if (!tokens || typeof tokens !== 'object') return;
    const style = document.createElement('style');
    style.setAttribute('data-brand-tokens', 'true');
    const rules = Object.entries(tokens).map(([k,v]) => `--${k.replace(/^--/, '')}: ${v};`).join('\n');
    style.textContent = `:root{\n${rules}\n}`;
    document.head.appendChild(style);
  }

  const config = readAdminConfig();
  applyBrandTokens(config?.brand?.tokens);

  // Provide a hook for admin-addon to refresh on-the-fly
  window.refreshAdminConfig = function () {
    const cfg = readAdminConfig();
    // reset tokens
    document.querySelectorAll('style[data-brand-tokens="true"]').forEach(n => n.remove());
    applyBrandTokens(cfg?.brand?.tokens);
    window.__ADMIN_CONFIG__ = cfg;
    if (window.refreshTemplates) window.refreshTemplates();
  };

  window.__ADMIN_CONFIG__ = config;
})();