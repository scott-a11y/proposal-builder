(() => {
  'use strict';

  // Image placeholder sanitizer - fixes ${images.*} 404s
  const sanitizePlaceholders = () => {
    // Find all elements that might contain image placeholder syntax
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
      // Check text content for ${images.*} patterns
      if (element.textContent && element.textContent.includes('${images.')) {
        const sanitized = element.textContent.replace(/\$\{images\.([^}]+)\}/g, (match, imageName) => {
          // Check if window.images exists and has the requested image
          if (window.images && window.images[imageName]) {
            return window.images[imageName];
          }
          // Return empty string or placeholder if image doesn't exist
          return '';
        });
        
        if (sanitized !== element.textContent) {
          element.textContent = sanitized;
        }
      }
      
      // Check innerHTML for ${images.*} patterns in attributes
      if (element.innerHTML && element.innerHTML.includes('${images.')) {
        const sanitized = element.innerHTML.replace(/\$\{images\.([^}]+)\}/g, (match, imageName) => {
          // Check if window.images exists and has the requested image
          if (window.images && window.images[imageName]) {
            return window.images[imageName];
          }
          // Return empty string or placeholder if image doesn't exist
          return '';
        });
        
        if (sanitized !== element.innerHTML) {
          element.innerHTML = sanitized;
        }
      }
      
      // Check specific attributes that commonly contain image URLs
      const imageAttributes = ['src', 'href', 'data-src', 'style'];
      imageAttributes.forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && value.includes('${images.')) {
          const sanitized = value.replace(/\$\{images\.([^}]+)\}/g, (match, imageName) => {
            // Check if window.images exists and has the requested image
            if (window.images && window.images[imageName]) {
              return window.images[imageName];
            }
            // Return empty string or placeholder if image doesn't exist
            return '';
          });
          
          if (sanitized !== value) {
            element.setAttribute(attr, sanitized);
          }
        }
      });
    });
  };

  // Run sanitization when images object is available
  const initSanitizer = () => {
    if (window.images) {
      sanitizePlaceholders();
    } else {
      // Wait for images to be available
      setTimeout(initSanitizer, 100);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSanitizer, { once: true });
  } else {
    initSanitizer();
  }

  // Re-run sanitization when images change
  window.addEventListener('imagesUpdated', sanitizePlaceholders);
  
  // Re-run sanitization on app renders
  const originalRenderApp = window.renderApp;
  if (typeof originalRenderApp === 'function') {
    window.renderApp = function(...args) {
      const result = originalRenderApp.apply(this, args);
      // Run sanitization after render
      setTimeout(sanitizePlaceholders, 10);
      return result;
    };
  }

  // Expose sanitizer for manual use
  window.sanitizeImagePlaceholders = sanitizePlaceholders;
})();