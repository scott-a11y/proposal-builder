/* Share-link.js - Sharing functionality for Foundry Cabinet Co
   Generates role-specific sharing links and manages access control
   Integrates with presentation mode and role gating system
*/

(() => {
  'use strict';

  // Share configuration
  const SHARE_CONFIG = {
    baseUrl: window.location.origin + window.location.pathname,
    defaultExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    maxExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  };

  // Storage keys
  const STORAGE_KEYS = {
    SHARED_LINKS: 'foundry-shared-links',
    SHARE_CONFIG: 'foundry-share-config'
  };

  // Share state
  let sharedLinks = new Map();
  let isInitialized = false;

  // Load existing shared links
  const loadSharedLinks = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHARED_LINKS);
      if (stored) {
        const parsed = JSON.parse(stored);
        sharedLinks = new Map(Object.entries(parsed));
        
        // Clean up expired links
        cleanupExpiredLinks();
      }
    } catch (e) {
      console.warn('Failed to load shared links:', e);
      sharedLinks = new Map();
    }
  };

  // Save shared links
  const saveSharedLinks = () => {
    try {
      const obj = Object.fromEntries(sharedLinks);
      localStorage.setItem(STORAGE_KEYS.SHARED_LINKS, JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save shared links:', e);
    }
  };

  // Clean up expired links
  const cleanupExpiredLinks = () => {
    const now = Date.now();
    let cleaned = false;
    
    sharedLinks.forEach((linkData, linkId) => {
      if (linkData.expiresAt && linkData.expiresAt < now) {
        sharedLinks.delete(linkId);
        cleaned = true;
      }
    });
    
    if (cleaned) {
      saveSharedLinks();
    }
  };

  // Generate unique link ID
  const generateLinkId = () => {
    return 'sl_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  // Create share link
  const createShareLink = (options = {}) => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: true };
    
    if (!permissions.share) {
      throw new Error('User does not have permission to create share links');
    }

    const defaults = {
      role: 'client',
      mode: 'presentation',
      expiresIn: SHARE_CONFIG.defaultExpiry,
      projectData: null,
      label: '',
      allowEdit: false,
      showRoleIndicator: false
    };

    const config = { ...defaults, ...options };
    
    // Validate expiry
    if (config.expiresIn > SHARE_CONFIG.maxExpiry) {
      config.expiresIn = SHARE_CONFIG.maxExpiry;
    }

    const linkId = generateLinkId();
    const expiresAt = Date.now() + config.expiresIn;
    
    // Create link data
    const linkData = {
      id: linkId,
      createdAt: Date.now(),
      expiresAt,
      createdBy: window.roleMode?.getCurrentRole() || 'admin',
      role: config.role,
      mode: config.mode,
      label: config.label || `${config.role} link created ${new Date().toLocaleDateString()}`,
      allowEdit: config.allowEdit,
      showRoleIndicator: config.showRoleIndicator,
      projectData: config.projectData,
      accessCount: 0,
      lastAccessed: null
    };

    // Store link data
    sharedLinks.set(linkId, linkData);
    saveSharedLinks();

    // Generate URL
    const url = new URL(SHARE_CONFIG.baseUrl);
    url.searchParams.set('share', linkId);
    url.searchParams.set('role', config.role);
    url.searchParams.set('mode', config.mode);
    
    if (config.showRoleIndicator) {
      url.searchParams.set('showRoleIndicator', 'true');
    }

    return {
      id: linkId,
      url: url.toString(),
      data: linkData
    };
  };

  // Validate and access shared link
  const accessShareLink = (linkId) => {
    const linkData = sharedLinks.get(linkId);
    
    if (!linkData) {
      return { valid: false, error: 'Link not found' };
    }

    const now = Date.now();
    if (linkData.expiresAt && linkData.expiresAt < now) {
      sharedLinks.delete(linkId);
      saveSharedLinks();
      return { valid: false, error: 'Link has expired' };
    }

    // Update access statistics
    linkData.accessCount++;
    linkData.lastAccessed = now;
    sharedLinks.set(linkId, linkData);
    saveSharedLinks();

    return { valid: true, data: linkData };
  };

  // Handle shared link from URL
  const handleSharedLink = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    
    if (!shareId) return false;

    const result = accessShareLink(shareId);
    
    if (!result.valid) {
      showShareError(result.error);
      return false;
    }

    const linkData = result.data;
    
    // Apply shared link configuration
    if (window.roleMode) {
      window.roleMode.switchRole(linkData.role);
      window.roleMode.switchMode(linkData.mode);
    }

    // Load project data if included
    if (linkData.projectData) {
      loadSharedProjectData(linkData.projectData);
    }

    // Show access notification
    showShareNotification(`Viewing as ${linkData.role} in ${linkData.mode} mode`);
    
    return true;
  };

  // Load shared project data
  const loadSharedProjectData = (projectData) => {
    if (!projectData || typeof window.loadProjectData !== 'function') return;
    
    try {
      // Merge with current form data
      if (window.formData && typeof projectData === 'object') {
        Object.assign(window.formData, projectData);
        
        // Trigger re-render if function exists
        if (typeof window.renderApp === 'function') {
          window.renderApp();
        }
      }
    } catch (e) {
      console.warn('Failed to load shared project data:', e);
    }
  };

  // Show share error
  const showShareError = (message) => {
    const notification = createNotification(message, 'error');
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  };

  // Show share notification
  const showShareNotification = (message) => {
    const notification = createNotification(message, 'info');
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  // Create notification element
  const createNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#DC2626' : '#059669';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10002;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      max-width: 300px;
      word-wrap: break-word;
    `;
    notification.textContent = message;
    
    return notification;
  };

  // Revoke share link
  const revokeShareLink = (linkId) => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: true };
    
    if (!permissions.share) {
      throw new Error('User does not have permission to revoke share links');
    }

    const existed = sharedLinks.has(linkId);
    sharedLinks.delete(linkId);
    saveSharedLinks();
    
    return existed;
  };

  // List all share links (admin/agent only)
  const listShareLinks = () => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: true };
    
    if (!permissions.share) {
      throw new Error('User does not have permission to list share links');
    }

    const now = Date.now();
    const links = [];
    
    sharedLinks.forEach((linkData, linkId) => {
      const isExpired = linkData.expiresAt && linkData.expiresAt < now;
      links.push({
        ...linkData,
        isExpired,
        url: `${SHARE_CONFIG.baseUrl}?share=${linkId}&role=${linkData.role}&mode=${linkData.mode}`
      });
    });
    
    return links.sort((a, b) => b.createdAt - a.createdAt);
  };

  // Create share UI
  const createShareUI = () => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: false };
    
    if (!permissions.share) return null;

    const shareContainer = document.createElement('div');
    shareContainer.className = 'share-controls';
    shareContainer.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 16px;
      z-index: 9999;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 280px;
      display: none;
    `;

    shareContainer.innerHTML = `
      <div style="margin-bottom: 12px; font-weight: 500; font-size: 14px;">Share Proposal</div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 12px; margin-bottom: 4px; color: #666;">Role</label>
        <select id="share-role" style="width: 100%; padding: 6px; border: 1px solid #e5e7eb; border-radius: 4px;">
          <option value="client">Client (View Only)</option>
          <option value="agent">Agent (Can Edit)</option>
        </select>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 12px; margin-bottom: 4px; color: #666;">Mode</label>
        <select id="share-mode" style="width: 100%; padding: 6px; border: 1px solid #e5e7eb; border-radius: 4px;">
          <option value="presentation">Presentation</option>
          <option value="edit">Edit</option>
        </select>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 12px; margin-bottom: 4px; color: #666;">Expires In</label>
        <select id="share-expiry" style="width: 100%; padding: 6px; border: 1px solid #e5e7eb; border-radius: 4px;">
          <option value="3600000">1 Hour</option>
          <option value="86400000">1 Day</option>
          <option value="604800000" selected>7 Days</option>
          <option value="2592000000">30 Days</option>
        </select>
      </div>
      
      <div style="display: flex; gap: 8px;">
        <button id="create-share-link" class="brand-button primary" style="flex: 1;">Create Link</button>
        <button id="close-share-ui" class="brand-button">Cancel</button>
      </div>
      
      <div id="share-result" style="margin-top: 12px; display: none;"></div>
    `;

    // Add event listeners
    shareContainer.querySelector('#create-share-link').onclick = () => {
      const role = shareContainer.querySelector('#share-role').value;
      const mode = shareContainer.querySelector('#share-mode').value;
      const expiresIn = parseInt(shareContainer.querySelector('#share-expiry').value);
      
      try {
        const result = createShareLink({
          role,
          mode,
          expiresIn,
          projectData: window.formData || null,
          showRoleIndicator: false
        });
        
        const resultDiv = shareContainer.querySelector('#share-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Share URL:</div>
          <input type="text" value="${result.url}" readonly style="width: 100%; padding: 6px; font-size: 11px; border: 1px solid #e5e7eb; border-radius: 4px;" onclick="this.select()">
          <div style="font-size: 11px; color: #666; margin-top: 4px;">Click to select and copy</div>
        `;
        
        // Auto-select the URL
        const urlInput = resultDiv.querySelector('input');
        urlInput.focus();
        urlInput.select();
        
      } catch (e) {
        showShareError(e.message);
      }
    };

    shareContainer.querySelector('#close-share-ui').onclick = () => {
      shareContainer.style.display = 'none';
    };

    return shareContainer;
  };

  // Create share button
  const createShareButton = () => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: false };
    
    if (!permissions.share) return null;

    const shareButton = document.createElement('button');
    shareButton.textContent = 'Share';
    shareButton.className = 'brand-button';
    shareButton.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 80px;
      z-index: 9999;
    `;
    
    const shareUI = createShareUI();
    if (shareUI) {
      document.body.appendChild(shareUI);
      
      shareButton.onclick = () => {
        const isVisible = shareUI.style.display !== 'none';
        shareUI.style.display = isVisible ? 'none' : 'block';
      };
    }

    return shareButton;
  };

  // Initialize sharing system
  const initialize = () => {
    if (isInitialized) return;
    
    loadSharedLinks();
    
    // Handle shared link if present in URL
    const wasSharedLink = handleSharedLink();
    
    // Create share UI for authorized users (only if not accessing via shared link)
    if (!wasSharedLink) {
      const shareButton = createShareButton();
      if (shareButton) {
        document.body.appendChild(shareButton);
      }
    }
    
    // Cleanup expired links periodically
    setInterval(cleanupExpiredLinks, 60000); // Every minute
    
    isInitialized = true;
    
    // Trigger share initialized event
    window.dispatchEvent(new CustomEvent('shareInitialized', {
      detail: { linksCount: sharedLinks.size }
    }));
  };

  // Public API
  window.shareLink = {
    // Initialization
    initialize,
    isInitialized: () => isInitialized,
    
    // Link management
    create: createShareLink,
    revoke: revokeShareLink,
    list: listShareLinks,
    access: accessShareLink,
    
    // UI creation
    createShareUI,
    createShareButton,
    
    // Utilities
    cleanupExpiredLinks,
    handleSharedLink,
    
    // Configuration
    SHARE_CONFIG,
    
    // State inspection
    getSharedLinks: () => Array.from(sharedLinks.entries())
  };

  // Auto-initialize when dependencies are ready
  const autoInit = () => {
    if (window.roleMode && window.proposalGuard) {
      initialize();
    } else {
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