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
    maxSnapshotUrlLength: 1800 // warn when exceeding common URL length limits
  };

  // Storage keys
  const STORAGE_KEYS = {
    SHARED_LINKS: 'foundry-shared-links',
    SHARE_CONFIG: 'foundry-share-config'
  };

  // Share state
  let sharedLinks = new Map();
  let isInitialized = false;

  // Floating buttons container utility
  const getOrCreateFloatingButtonContainer = () => {
    let container = document.getElementById('floating-buttons-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'floating-buttons-container';
      container.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 9999;
        display: flex;
        gap: 12px;
        align-items: center;
      `;
      if (document.body) {
        document.body.appendChild(container);
      }
    }
    return container;
  };

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
    if (cleaned) saveSharedLinks();
  };

  // Generate unique link ID
  const generateLinkId = () => 'sl_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

  // Tiny helpers for snapshot encoding/decoding (UTF-8 safe)
  const encodeSnapshot = (obj) => {
    try {
      const json = JSON.stringify(obj);
      return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    } catch (e) {
      console.warn('encodeSnapshot failed:', e);
      return '';
    }
  };
  const decodeSnapshot = (str) => {
    try {
      const json = decodeURIComponent(str);
      return JSON.parse(decodeURIComponent(escape(atob(json))));
    } catch (e) {
      console.warn('decodeSnapshot failed:', e);
      return null;
    }
  };

  // Best-effort image compression for embedding
  const compressImage = (src, maxW = 1200, quality = 0.72) => new Promise((resolve) => {
    try {
      if (!src) return resolve('');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const ratio = img.width > maxW ? maxW / img.width : 1;
          const w = Math.max(1, Math.round(img.width * ratio));
          const h = Math.max(1, Math.round(img.height * ratio));
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const out = canvas.toDataURL('image/jpeg', quality);
          resolve(out || src);
        } catch (err) {
          console.warn('compressImage failed (draw):', err);
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    } catch (e) { resolve(src); }
  });

  const compressImagesIfRequested = async (images, includeImages) => {
    if (!includeImages) return null; // omit images for text-only snapshot
    const keys = Object.keys(images || {});
    const out = {};
    await Promise.all(keys.map(async (k) => {
      out[k] = images[k] ? await compressImage(images[k]) : '';
    }));
    return out;
  };

  // Create share link (localStorage-backed)
  const createShareLink = (options = {}) => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: true };
    if (!permissions.share) throw new Error('User does not have permission to create share links');

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
    if (config.expiresIn > SHARE_CONFIG.maxExpiry) config.expiresIn = SHARE_CONFIG.maxExpiry;

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
    if (config.showRoleIndicator) url.searchParams.set('showRoleIndicator', 'true');

    return { id: linkId, url: url.toString(), data: linkData };
  };

  // Create URL-embedded snapshot link (no backend)
  const createEmbedLink = async (options = {}) => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: true };
    if (!permissions.share) throw new Error('User does not have permission to create embed links');

    const defaults = { role: 'client', mode: 'presentation', includeImages: false, label: '' };
    const config = { ...defaults, ...options };

    // Build snapshot payload
    const snapshot = {
      v: 1,
      createdAt: Date.now(),
      role: config.role,
      mode: config.mode,
      label: config.label || `${config.role} snapshot ${new Date().toLocaleDateString()}`,
      formData: window.formData || {},
      images: await compressImagesIfRequested(window.images || {}, !!config.includeImages)
    };

    const payload = encodeSnapshot(snapshot);
    const url = new URL(SHARE_CONFIG.baseUrl);
    url.searchParams.set('role', config.role);
    url.searchParams.set('mode', config.mode);
    url.hash = `snapshot=${payload}`;

    const full = url.toString();
    if (full.length > SHARE_CONFIG.maxSnapshotUrlLength) {
      showShareError(`Warning: Link is long (${full.length} chars). Some apps may truncate it.`);
    }

    return { url: full, data: snapshot };
  };

  // Validate and access shared link (local)
  const accessShareLink = (linkId) => {
    const linkData = sharedLinks.get(linkId);
    if (!linkData) return { valid: false, error: 'Link not found' };

    const now = Date.now();
    if (linkData.expiresAt && linkData.expiresAt < now) {
      sharedLinks.delete(linkId);
      saveSharedLinks();
      return { valid: false, error: 'Link has expired' };
    }

    // Update access statistics
    linkData.accessCount++; linkData.lastAccessed = now;
    sharedLinks.set(linkId, linkData); saveSharedLinks();

    return { valid: true, data: linkData };
  };

  // Apply snapshot from URL hash if present
  const handleSnapshotHash = () => {
    const hash = (window.location.hash || '').replace(/^#/, '');
    if (!hash.startsWith('snapshot=')) return false;
    const encoded = hash.slice('snapshot='.length);
    const snap = decodeSnapshot(encoded);
    if (!snap) { showShareError('Invalid snapshot link'); return false; }

    try {
      if (window.roleMode) {
        window.roleMode.switchRole(snap.role || 'client');
        window.roleMode.switchMode(snap.mode || 'presentation');
      }
      if (typeof window.formData === 'object' && snap.formData) {
        Object.assign(window.formData, snap.formData);
      }
      if (typeof window.images === 'object' && snap.images) {
        Object.assign(window.images, snap.images);
      }
      if (typeof window.renderApp === 'function') window.renderApp();
      showShareNotification(`Loaded embedded ${snap.role || 'client'} snapshot`);
      return true;
    } catch (e) {
      console.warn('Failed loading snapshot:', e);
      showShareError('Failed to load embedded snapshot');
      return false;
    }
  };

  // Handle shared link from URL (localStorage-based)
  const handleSharedLink = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    if (!shareId) return false;

    const result = accessShareLink(shareId);
    if (!result.valid) { showShareError(result.error); return false; }

    const linkData = result.data;
    if (window.roleMode) {
      window.roleMode.switchRole(linkData.role);
      window.roleMode.switchMode(linkData.mode);
    }
    if (linkData.projectData) loadSharedProjectData(linkData.projectData);
    showShareNotification(`Viewing as ${linkData.role} in ${linkData.mode} mode`);
    return true;
  };

  // Load shared project data into current app state
  const loadSharedProjectData = (projectData) => {
    if (!projectData || typeof window.loadProjectData !== 'function') return;
    try {
      if (window.formData && typeof projectData === 'object') {
        Object.assign(window.formData, projectData);
        if (typeof window.renderApp === 'function') window.renderApp();
      }
    } catch (e) { console.warn('Failed to load shared project data:', e); }
  };

  // Notifications
  const createNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#DC2626' : '#059669';
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: white; padding: 12px 20px; border-radius: 6px; z-index: 10002; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 320px; word-wrap: break-word;`;
    notification.textContent = message;
    return notification;
  };
  const showShareError = (message) => {
    const n = createNotification(message, 'error');
    if (document.body) {
      document.body.appendChild(n); 
      setTimeout(() => { if (n.parentNode) n.remove(); }, 5000);
    }
  };
  const showShareNotification = (message) => {
    const n = createNotification(message, 'info');
    if (document.body) {
      document.body.appendChild(n); 
      setTimeout(() => { if (n.parentNode) n.remove(); }, 3000);
    }
  };

  // Revoke share link
  const revokeShareLink = (linkId) => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: true };
    if (!permissions.share) throw new Error('User does not have permission to revoke share links');
    const existed = sharedLinks.has(linkId);
    sharedLinks.delete(linkId); saveSharedLinks();
    return existed;
  };

  // List share links (admin/agent only)
  const listShareLinks = () => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: true };
    if (!permissions.share) throw new Error('User does not have permission to list share links');
    const now = Date.now();
    const links = [];
    sharedLinks.forEach((linkData, linkId) => {
      const isExpired = linkData.expiresAt && linkData.expiresAt < now;
      links.push({ ...linkData, isExpired, url: `${SHARE_CONFIG.baseUrl}?share=${linkId}&role=${linkData.role}&mode=${linkData.mode}` });
    });
    return links.sort((a, b) => b.createdAt - a.createdAt);
  };

  // Copy Link pill shown in Presentation mode
  const createCopyLinkPill = () => {
    const isPresentation = window.roleMode?.isPresentationMode?.() === true;
    if (!isPresentation) return null;
    const pill = document.createElement('div');
    pill.className = 'copy-link-pill';
    pill.style.cssText = 'position: fixed; top: 16px; right: 16px; z-index: 10000; background: rgba(255,255,255,0.9); border: 1px solid #e5e7eb; padding: 8px 12px; border-radius: 9999px; font-size: 12px; cursor: pointer; backdrop-filter: blur(6px);';
    pill.textContent = 'Copy Link';
    pill.onclick = async () => {
      try { await navigator.clipboard.writeText(window.location.href); showShareNotification('Link copied'); } catch { showShareError('Copy failed'); }
    };
    return pill;
  };

  // Create share UI
  const createShareUI = () => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: false };
    if (!permissions.share) return null;

    const shareContainer = document.createElement('div');
    shareContainer.className = 'share-controls';
    shareContainer.style.cssText = `position: fixed; bottom: 80px; right: 16px; z-index: 9999; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 300px; display: none;`;

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
      <div style="margin: 10px 0 12px 0; padding: 8px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px;">
        <label style="font-size: 12px; color: #444; display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="embed-data" /> Embed data in link (no backend)
        </label>
        <label style="font-size: 12px; color: #666; display: flex; align-items: center; gap: 8px; margin-top: 6px;">
          <input type="checkbox" id="embed-images" /> Include images (compressed)
        </label>
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="create-share-link" class="brand-button primary" style="flex: 1;">Create Link</button>
        <button id="create-embed-link" class="brand-button" style="flex: 1;">Create Embed Link</button>
        <button id="close-share-ui" class="brand-button">Cancel</button>
      </div>
      <div id="share-result" style="margin-top: 12px; display: none;"></div>
    `;

    // Local (managed) link
    shareContainer.querySelector('#create-share-link').onclick = () => {
      const role = shareContainer.querySelector('#share-role').value;
      const mode = shareContainer.querySelector('#share-mode').value;
      const expiresIn = parseInt(shareContainer.querySelector('#share-expiry').value);
      try {
        const result = createShareLink({ role, mode, expiresIn, projectData: window.formData || null, showRoleIndicator: false });
        const resultDiv = shareContainer.querySelector('#share-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Share URL:</div>
          <input type="text" value="${result.url}" readonly style="width: 100%; padding: 6px; font-size: 11px; border: 1px solid #e5e7eb; border-radius: 4px;" onclick="this.select()">
          <div style="font-size: 11px; color: #666; margin-top: 4px;">Click to select and copy</div>
        `;
        const urlInput = resultDiv.querySelector('input'); urlInput.focus(); urlInput.select();
      } catch (e) { showShareError(e.message); }
    };

    // Embed (URL snapshot)
    shareContainer.querySelector('#create-embed-link').onclick = async () => {
      const role = shareContainer.querySelector('#share-role').value;
      const mode = shareContainer.querySelector('#share-mode').value;
      const embedData = shareContainer.querySelector('#embed-data').checked;
      const embedImages = shareContainer.querySelector('#embed-images').checked;
      if (!embedData) { showShareError('Enable "Embed data in link" first.'); return; }
      try {
        const { url } = await createEmbedLink({ role, mode, includeImages: embedImages });
        const resultDiv = shareContainer.querySelector('#share-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Embed URL:</div>
          <input type="text" value="${url}" readonly style="width: 100%; padding: 6px; font-size: 11px; border: 1px solid #e5e7eb; border-radius: 4px;" onclick="this.select()">
          <div style="font-size: 11px; color: #666; margin-top: 4px;">Click to select and copy</div>
        `;
        const urlInput = resultDiv.querySelector('input'); urlInput.focus(); urlInput.select();
      } catch (e) { showShareError(e.message || 'Failed to create embed link'); }
    };

    shareContainer.querySelector('#close-share-ui').onclick = () => { shareContainer.style.display = 'none'; };
    return shareContainer;
  };

  // Create share button
  const createShareButton = () => {
    const permissions = window.proposalGuard?.getCurrentPermissions() || { share: false };
    if (!permissions.share) return null;

    const shareButton = document.createElement('button');
    shareButton.textContent = 'Share';
    shareButton.className = 'brand-button';
    // Remove fixed positioning - will be handled by container

    const shareUI = createShareUI();
    if (shareUI && document.body) {
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

    // 1) Handle embedded snapshot if present
    const hadSnapshot = handleSnapshotHash();

    // 2) Handle local shared link if present in URL
    const hadSharedLink = !hadSnapshot && handleSharedLink();

    // 3) Share UI for authorized users (only if not accessing via a local shared link)
    if (!hadSharedLink) {
      const shareButton = createShareButton();
      if (shareButton) {
        const container = getOrCreateFloatingButtonContainer();
        container.appendChild(shareButton);
      }
    }

    // 4) Copy Link pill in presentation mode
    const pill = createCopyLinkPill();
    if (pill && document.body) document.body.appendChild(pill);

    // Cleanup expired links periodically
    setInterval(cleanupExpiredLinks, 60000); // Every minute

    isInitialized = true;

    // Trigger share initialized event
    window.dispatchEvent(new CustomEvent('shareInitialized', { detail: { linksCount: sharedLinks.size } }));
  };

  // Public API
  window.shareLink = {
    // Initialization
    initialize,
    isInitialized: () => isInitialized,
    // Link management
    create: createShareLink,
    createEmbed: createEmbedLink,
    revoke: revokeShareLink,
    list: listShareLinks,
    access: accessShareLink,
    // UI creation
    createShareUI,
    createShareButton,
    // Utilities
    cleanupExpiredLinks,
    handleSharedLink,
    handleSnapshotHash,
    getOrCreateFloatingButtonContainer,
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