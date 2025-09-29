/* Proposal-guard.js - Role-based access control for Foundry Cabinet Co
   Provides strict role gating and guards admin functionality
   Maintains backward compatibility with existing behavior as default
*/

(() => {
  'use strict';

  // Guard state
  let isInitialized = false;
  let guardedElements = new Map();
  let originalElements = new Map();

  // Guard configuration
  const GUARD_CONFIG = {
    // Elements that require specific roles
    adminOnly: [
      '.admin-fab',
      '.admin-modal',
      '.admin-console',
      '[data-admin-only]'
    ],
    
    agentAndAbove: [
      '[onclick*="export"]',
      '.export-controls',
      '[data-agent-required]'
    ],
    
    editMode: [
      'input:not([readonly])',
      'textarea:not([readonly])',
      'select:not([disabled])',
      'button[onclick*="generate"]',
      'button[onclick*="save"]',
      '.edit-controls',
      '[data-edit-only]'
    ],

    // Elements to hide in presentation mode
    presentationHidden: [
      '.print-hidden',
      '.edit-controls',
      'button[onclick*="edit"]',
      '.template-selector',
      '[data-presentation-hide]'
    ]
  };

  // Permission matrix
  const PERMISSIONS = {
    admin: {
      viewAdmin: true,
      edit: true,
      export: true,
      share: true,
      switchMode: true,
      manageRoles: true
    },
    agent: {
      viewAdmin: false,
      edit: true,
      export: true,
      share: true,
      switchMode: true,
      manageRoles: false
    },
    client: {
      viewAdmin: false,
      edit: false,
      export: false,
      share: false,
      switchMode: false,
      manageRoles: false
    }
  };

  // Get current user permissions
  const getCurrentPermissions = () => {
    const role = window.roleMode?.getCurrentRole() || 'admin';
    return PERMISSIONS[role] || PERMISSIONS.admin;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    const permissions = getCurrentPermissions();
    return permissions[permission] || false;
  };

  // Guard admin elements
  const guardAdminElements = () => {
    const permissions = getCurrentPermissions();
    
    if (!permissions.viewAdmin) {
      GUARD_CONFIG.adminOnly.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!guardedElements.has(element)) {
            originalElements.set(element, {
              display: element.style.display,
              visibility: element.style.visibility
            });
            guardedElements.set(element, 'admin');
          }
          element.style.display = 'none';
        });
      });
    } else {
      // Restore admin elements if permission exists
      guardedElements.forEach((guardType, element) => {
        if (guardType === 'admin') {
          const original = originalElements.get(element);
          if (original) {
            element.style.display = original.display;
            element.style.visibility = original.visibility;
          }
          guardedElements.delete(element);
          originalElements.delete(element);
        }
      });
    }
  };

  // Guard export/agent elements
  const guardAgentElements = () => {
    const permissions = getCurrentPermissions();
    
    if (!permissions.export) {
      GUARD_CONFIG.agentAndAbove.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!guardedElements.has(element)) {
            originalElements.set(element, {
              display: element.style.display,
              onclick: element.onclick,
              disabled: element.disabled
            });
            guardedElements.set(element, 'agent');
          }
          element.style.display = 'none';
          element.onclick = null;
          if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
            element.disabled = true;
          }
        });
      });
    } else {
      // Restore agent elements if permission exists
      guardedElements.forEach((guardType, element) => {
        if (guardType === 'agent') {
          const original = originalElements.get(element);
          if (original) {
            element.style.display = original.display;
            element.onclick = original.onclick;
            element.disabled = original.disabled;
          }
          guardedElements.delete(element);
          originalElements.delete(element);
        }
      });
    }
  };

  // Guard edit mode elements
  const guardEditElements = () => {
    const permissions = getCurrentPermissions();
    const isEditMode = window.roleMode?.isEditMode() !== false; // Default to true for backward compatibility
    
    if (!permissions.edit || !isEditMode) {
      GUARD_CONFIG.editMode.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!guardedElements.has(element)) {
            originalElements.set(element, {
              readonly: element.readonly,
              disabled: element.disabled,
              onclick: element.onclick,
              style: element.style.cssText
            });
            guardedElements.set(element, 'edit');
          }
          
          // Make form elements readonly/disabled
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.readonly = true;
            element.style.pointerEvents = 'none';
            element.style.background = 'transparent';
            element.style.border = 'none';
          } else if (element.tagName === 'SELECT') {
            element.disabled = true;
            element.style.pointerEvents = 'none';
            element.style.background = 'transparent';
          } else if (element.tagName === 'BUTTON') {
            element.disabled = true;
            element.style.display = 'none';
          }
          
          // Remove click handlers
          element.onclick = null;
        });
      });
    } else {
      // Restore edit elements if permission exists
      guardedElements.forEach((guardType, element) => {
        if (guardType === 'edit') {
          const original = originalElements.get(element);
          if (original) {
            element.readonly = original.readonly;
            element.disabled = original.disabled;
            element.onclick = original.onclick;
            element.style.cssText = original.style;
          }
          guardedElements.delete(element);
          originalElements.delete(element);
        }
      });
    }
  };

  // Guard presentation mode elements
  const guardPresentationElements = () => {
    const isPresentationMode = window.roleMode?.isPresentationMode() || false;
    
    if (isPresentationMode) {
      GUARD_CONFIG.presentationHidden.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!guardedElements.has(element)) {
            originalElements.set(element, {
              display: element.style.display,
              visibility: element.style.visibility
            });
            guardedElements.set(element, 'presentation');
          }
          element.style.display = 'none';
        });
      });
    } else {
      // Restore presentation elements if not in presentation mode
      guardedElements.forEach((guardType, element) => {
        if (guardType === 'presentation') {
          const original = originalElements.get(element);
          if (original) {
            element.style.display = original.display;
            element.style.visibility = original.visibility;
          }
          guardedElements.delete(element);
          originalElements.delete(element);
        }
      });
    }
  };

  // Guard function calls and window methods
  const guardFunctionCalls = () => {
    const permissions = getCurrentPermissions();
    const isPresentation = window.roleMode?.isPresentationMode?.() === true;
    
    // Guard admin functions
    if (!permissions.viewAdmin && window.openAdmin) {
      window.openAdmin = () => {
        console.warn('Admin access denied for current role');
        showAccessDenied('Administrator privileges required');
      };
    }

    // Guard export functions (keep blocked for low-privilege roles)
    if (!permissions.export) {
      const exportFunctions = ['exportProposal', 'downloadProposal'];
      exportFunctions.forEach(funcName => {
        if (window[funcName]) {
          window[funcName] = () => {
            console.warn(`Export access denied for current role: ${funcName}`);
            showAccessDenied('Export privileges required');
          };
        }
      });
    }

    // Allow printing in presentation mode; otherwise guard like export
    if (!isPresentation && !permissions.export && window.printProposal) {
      window.printProposal = () => {
        console.warn('Print access denied for current role outside presentation mode');
        showAccessDenied('Print privileges required');
      };
    }

    // Guard edit functions
    if (!permissions.edit) {
      const editFunctions = ['saveProject', 'generateProposal', 'handleImageUpload'];
      editFunctions.forEach(funcName => {
        if (window[funcName]) {
          window[funcName] = () => {
            console.warn(`Edit access denied for current role: ${funcName}`);
            showAccessDenied('Edit privileges required');
          };
        }
      });
    }
  };

  // Show access denied message
  const showAccessDenied = (message) => {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #DC2626;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 10001;
      font-size: 14px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  // Apply all guards
  const applyAllGuards = () => {
    guardAdminElements();
    guardAgentElements();
    guardEditElements();
    guardPresentationElements();
    guardFunctionCalls();
  };

  // Remove all guards (restore original state)
  const removeAllGuards = () => {
    guardedElements.forEach((guardType, element) => {
      const original = originalElements.get(element);
      if (original) {
        // Restore original properties
        Object.entries(original).forEach(([prop, value]) => {
          if (prop === 'style') {
            element.style.cssText = value;
          } else {
            element[prop] = value;
          }
        });
      }
    });
    
    guardedElements.clear();
    originalElements.clear();
  };

  // Mutation observer to guard dynamically added elements
  const observeDOM = () => {
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              shouldReapply = true;
            }
          });
        }
      });
      
      if (shouldReapply) {
        // Debounce reapplication
        clearTimeout(observeDOM.timeout);
        observeDOM.timeout = setTimeout(() => {
          applyAllGuards();
        }, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return observer;
  };

  // Initialize guards
  const initialize = () => {
    if (isInitialized) return;
    
    applyAllGuards();
    observeDOM();
    
    // Listen for role/mode changes
    window.addEventListener('roleChanged', applyAllGuards);
    window.addEventListener('modeChanged', applyAllGuards);
    
    // Listen for configuration changes
    window.addEventListener('configUpdated', applyAllGuards);
    
    isInitialized = true;
    
    // Trigger guard initialized event
    window.dispatchEvent(new CustomEvent('guardInitialized', {
      detail: { permissions: getCurrentPermissions() }
    }));
  };

  // Public API
  window.proposalGuard = {
    // Initialization
    initialize,
    isInitialized: () => isInitialized,
    
    // Permission checking
    hasPermission,
    getCurrentPermissions,
    
    // Guard control
    applyAllGuards,
    removeAllGuards,
    
    // Individual guard methods
    guardAdminElements,
    guardAgentElements,
    guardEditElements,
    guardPresentationElements,
    
    // Access control
    showAccessDenied,
    
    // Configuration
    GUARD_CONFIG,
    PERMISSIONS,
    
    // State inspection
    getGuardedElements: () => Array.from(guardedElements.keys()),
    getOriginalElements: () => Array.from(originalElements.keys())
  };

  // Auto-initialize when dependencies are ready
  const autoInit = () => {
    // Wait for roleMode to be available
    if (window.roleMode && window.configLoader) {
      initialize();
    } else {
      // Retry after a short delay
      setTimeout(autoInit, 100);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  } else {
    autoInit();
  }

})();