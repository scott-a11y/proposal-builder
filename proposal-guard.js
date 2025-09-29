/* Proposal Absolutes: block Present/Export/Share until required criteria are met.
   Wraps existing global functions without modifying them. Safe if functions are absent. */
(function () {
  const CFG = () => window.__ADMIN_CONFIG__ || {};

  function bytesFromDataUrl(dataUrl) {
    try {
      if (!dataUrl || !dataUrl.startsWith('data:')) return 0;
      const base64 = dataUrl.split(',')[1] || '';
      return Math.ceil((base64.length * 3) / 4);
    } catch { return 0; }
  }

  function mb(bytes) { return (bytes / (1024*1024)); }

  function validateAbsolutes() {
    const cfg = CFG();
    const abs = cfg.absolutes || {};
    const errs = [];

    const fd = window.formData || {};
    const imgs = window.images || {};

    // Required fields
    (abs.requiredFields || []).forEach(key => {
      if (!fd[key] || String(fd[key]).trim() === '') {
        errs.push(`Missing required field: ${key}`);
      }
    });

    // Required sections
    (abs.requiredSections || []).forEach(key => {
      if (!fd[key] || String(fd[key]).trim().length < 10) {
        errs.push(`Section needs content: ${key}`);
      }
    });

    // Alt text check (enforce for main images)
    if (abs.requireAltText) {
      const altMap = {
        logo: 'Company logo',
        shakerRender: 'Shaker style render',
        euroRender: 'Euro style render',
        shakerVanity: 'Shaker vanity render',
        euroVanity: 'Euro vanity render',
        floorPlan: 'Floor plan'
      };
      Object.keys(altMap).forEach(k => {
        if (imgs[k] && !fd[`${k}Alt`]) {
          errs.push(`Alt text missing for: ${k}`);
        }
      });
    }

    // Image size caps
    const limitMB = abs.maxImageMB || 4;
    Object.entries(window.images || {}).forEach(([k, v]) => {
      if (!v || typeof v !== 'string' || !v.startsWith('data:')) return;
      const sizeMB = mb(bytesFromDataUrl(v));
      if (sizeMB > limitMB) errs.push(`Image “${k}” is ${sizeMB.toFixed(2)}MB (limit ${limitMB}MB)`);
    });

    // Legal completeness
    if (!cfg.legal?.terms) errs.push('Legal terms are not configured in Admin.');
    if (!cfg.legal?.validityDays) errs.push('Validity window (days) is not configured in Admin.');
    if (cfg.legal?.depositPercent == null) errs.push('Deposit percent is not configured in Admin.');

    return errs;
  }

  function showBlockingModal(errors) {
    alert(
      'Proposal not ready for presentation:\n\n' +
      errors.map((e, i) => `${i+1}. ${e}`).join('\n') +
      '\n\nOpen Admin to resolve these items.'
    );
  }

  function guard(fn) {
    return async function guarded() {
      const errors = validateAbsolutes();
      if (errors.length) { showBlockingModal(errors); return; }
      return await fn.apply(this, arguments);
    };
  }

  // Wrap existing global entry points if present
  if (typeof window.generateProposal === 'function') {
    window.generateProposal = guard(window.generateProposal);
  }
  if (typeof window.exportProposal === 'function') {
    window.exportProposal = guard(window.exportProposal);
  }
  if (typeof window.printProposal === 'function') {
    window.printProposal = guard(window.printProposal);
  }
})();