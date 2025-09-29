(() => {
  // Resolve any literal ${images.*} placeholders left in markup
  const INLINE_FALLBACK_LOGO =
    'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="220" viewBox="0 0 800 220">
         <rect fill="#000000" width="800" height="220"/>
         <g fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial">
           <text x="50%" y="35%" text-anchor="middle" font-size="48" font-weight="700">FOUNDRY</text>
           <text x="50%" y="55%" text-anchor="middle" font-size="24" letter-spacing="4">CABINET · CO</text>
           <text x="50%" y="75%" text-anchor="middle" font-size="14" letter-spacing="2">BY DISTRICT DESIGN BUILD, LLC</text>
         </g>
       </svg>`
    );

  const resolve = (key) =>
    (window.images && window.images[key]) || (key === 'logo' ? INLINE_FALLBACK_LOGO : '');

  const fixImgPlaceholders = (root = document) => {
    root.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || '';
      const m = src.match(/\$\{images\.([a-zA-Z0-9_]+)\}/);
      if (m) {
        const val = resolve(m[1]);
        if (val) img.setAttribute('src', val);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => fixImgPlaceholders(), { once: true });
  } else {
    fixImgPlaceholders();
  }

  // Re-run after app renders if it dispatches a custom event
  window.addEventListener('renderComplete', () => fixImgPlaceholders());
})();