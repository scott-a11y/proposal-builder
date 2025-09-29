/* Role-mode.js - Role detection and mode switching for Foundry Cabinet Co
   Handles admin/agent/client role detection and presentation mode switching
   Maintains backward compatibility with existing admin/edit behavior as default
*/

(() => {
  'use strict';

  // Role definitions
  const ROLES = {
    ADMIN: 'admin',
    AGENT: 'agent', 
    CLIENT: 'client'
  };

  // Mode definitions
  const MODES = {
    EDIT: 'edit',
    PRESENTATION: 'presentation'
  };

  // Storage keys
  const STORAGE_KEYS = {
    USER_ROLE: 'foundry-user-role',
    VIEW_MODE: 'foundry-view-mode',
    ROLE_CONFIG: 'foundry-role-config'
  };

  // Global state
  let currentRole = ROLES.ADMIN; // Default to admin for backward compatibility
  let currentMode = MODES.EDIT; // Default to edit mode
  let roleConfig = null;

  // Role configuration with permissions
  const defaultRoleConfig = {
    [ROLES.ADMIN]: {
      canEdit: true,
      canViewAdmin: true,
      canExport: true,
      canShare: true,
      canSwitchMode: true,
      canManageRoles: true,
      label: 'Administrator'
    },
    [ROLES.AGENT]: {
      canEdit: true,
      canViewAdmin: false,
      canExport: true,
      canShare: true,
      canSwitchMode: true,
      canManageRoles: false,
      label: 'Agent'
    },
    [ROLES.CLIENT]: {
      canEdit: false,
      canViewAdmin: false,
      canExport: false,
      canShare: false,
      canSwitchMode: false,
      canManageRoles: false,
      label: 'Client'
    }
  };

  // Load role configuration
  const loadRoleConfig = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROLE_CONFIG);
      roleConfig = stored ? { ...defaultRoleConfig, ...JSON.parse(stored) } : defaultRoleConfig;
    } catch (e) {
      console.warn('Failed to load role config, using defaults:', e);
      roleConfig = defaultRoleConfig;
    }
  };

  // Save role configuration
  const saveRoleConfig = (config) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE_CONFIG, JSON.stringify(config));
      roleConfig = { ...defaultRoleConfig, ...config };
    } catch (e) {
      console.warn('Failed to save role config:', e);
    }
  };

  // Detect role from URL parameters or storage
  const detectRole = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role');
    const urlMode = urlParams.get('mode');
    
    // Priority: URL params > localStorage > default (admin for backward compatibility)
    if (urlRole && Object.values(ROLES).includes(urlRole)) {
      currentRole = urlRole;
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, urlRole);
    } else {
      const storedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
      currentRole = storedRole && Object.values(ROLES).includes(storedRole) ? storedRole : ROLES.ADMIN;
    }

    // Handle mode detection
    if (urlMode && Object.values(MODES).includes(urlMode)) {
      currentMode = urlMode;
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, urlMode);
    } else {
      const storedMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
      currentMode = storedMode && Object.values(MODES).includes(storedMode) ? storedMode : MODES.EDIT;
    }

    // Auto-switch clients to presentation mode unless explicitly set to edit
    if (currentRole === ROLES.CLIENT && !urlMode && !localStorage.getItem(STORAGE_KEYS.VIEW_MODE)) {
      currentMode = MODES.PRESENTATION;
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, MODES.PRESENTATION);
    }
  };

  // Apply role-based restrictions
  const applyRoleRestrictions = () => {
    const permissions = roleConfig[currentRole];
    const body = document.body;

    // Apply role class to body
    body.classList.remove('role-admin', 'role-agent', 'role-client');
    body.classList.add(`role-${currentRole}`);

    // Hide/show elements based on permissions
    if (!permissions.canEdit) {
      body.classList.add('role-readonly');
    }

    if (!permissions.canViewAdmin) {
      const adminElements = document.querySelectorAll('.admin-fab, .admin-only');
      adminElements.forEach(el => el.style.display = 'none');
    }

    if (!permissions.canExport) {
      const exportButtons = document.querySelectorAll('[onclick*="export"]');
      exportButtons.forEach(el => el.style.display = 'none');
    }

    if (!permissions.canShare) {
      const shareElements = document.querySelectorAll('.share-controls');
      shareElements.forEach(el => el.style.display = 'none');
    }
  };

  // Apply presentation mode
  const applyPresentationMode = () => {
    const body = document.body;
    
    if (currentMode === MODES.PRESENTATION) {
      body.classList.add('presentation-mode');
      body.classList.remove('edit-mode');
      
      // Create presentation-specific elements
      createPresentationElements();
    } else {
      body.classList.remove('presentation-mode');
      body.classList.add('edit-mode');
      
      // Remove presentation-specific elements
      removePresentationElements();
    }
  };

  // Create presentation mode elements
  const createPresentationElements = () => {
    // Create role indicator (hidden for clients)
    if (currentRole !== ROLES.CLIENT) {
      createRoleIndicator();
    }

    // Create mode switcher for authorized roles
    if (roleConfig[currentRole].canSwitchMode) {
      createModeSwitcher();
    }
  };

  // Remove presentation mode elements
  const removePresentationElements = () => {
    const existingIndicator = document.querySelector('.role-indicator');
    const existingSwitcher = document.querySelector('.mode-switcher');
    
    if (existingIndicator) existingIndicator.remove();
    if (existingSwitcher) existingSwitcher.remove();
  };

  // Create role indicator
  const createRoleIndicator = () => {
    const existing = document.querySelector('.role-indicator');
    if (existing) existing.remove();

    const indicator = document.createElement('div');
    indicator.className = `role-indicator ${currentRole}`;
    indicator.textContent = `${roleConfig[currentRole].label} Mode`;
    indicator.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 10000;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    `;
    
    document.body.appendChild(indicator);
  };

  // Create mode switcher
  const createModeSwitcher = () => {
    const existing = document.querySelector('.mode-switcher');
    if (existing) existing.remove();

    const switcher = document.createElement('div');
    switcher.className = 'mode-switcher';
    switcher.style.cssText = `
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 10000;
      display: flex;
      gap: 8px;
    `;

    // Edit mode button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = `brand-button ${currentMode === MODES.EDIT ? 'primary' : ''}`;
    editBtn.onclick = () => switchMode(MODES.EDIT);

    // Presentation mode button  
    const presentBtn = document.createElement('button');
    presentBtn.textContent = 'Present';
    presentBtn.className = `brand-button ${currentMode === MODES.PRESENTATION ? 'primary' : ''}`;
    presentBtn.onclick = () => switchMode(MODES.PRESENTATION);

    switcher.appendChild(editBtn);
    switcher.appendChild(presentBtn);
    document.body.appendChild(switcher);
  };

  // Switch between modes
  const switchMode = (newMode) => {
    if (!roleConfig[currentRole].canSwitchMode) {
      console.warn('User does not have permission to switch modes');
      return;
    }

    currentMode = newMode;
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, newMode);
    
    applyPresentationMode();
    createPresentationElements();
    
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('modeChanged', { 
      detail: { mode: newMode, role: currentRole } 
    }));
  };

  // Switch roles (admin only)
  const switchRole = (newRole) => {
    if (currentRole !== ROLES.ADMIN) {
      console.warn('Only administrators can switch roles');
      return;
    }

    if (!Object.values(ROLES).includes(newRole)) {
      console.warn('Invalid role:', newRole);
      return;
    }

    currentRole = newRole;
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, newRole);
    
    applyRoleRestrictions();
    applyPresentationMode();
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('roleChanged', { 
      detail: { role: newRole, mode: currentMode } 
    }));
  };

  // Public API
  window.roleMode = {
    // Getters
    getCurrentRole: () => currentRole,
    getCurrentMode: () => currentMode,
    getRoleConfig: () => roleConfig,
    
    // Setters
    switchMode,
    switchRole,
    
    // Role checks
    canEdit: () => roleConfig[currentRole].canEdit,
    canViewAdmin: () => roleConfig[currentRole].canViewAdmin,
    canExport: () => roleConfig[currentRole].canExport,
    canShare: () => roleConfig[currentRole].canShare,
    canSwitchMode: () => roleConfig[currentRole].canSwitchMode,
    canManageRoles: () => roleConfig[currentRole].canManageRoles,
    
    // Mode checks
    isEditMode: () => currentMode === MODES.EDIT,
    isPresentationMode: () => currentMode === MODES.PRESENTATION,
    
    // Constants
    ROLES,
    MODES,
    
    // Config management
    updateRoleConfig: saveRoleConfig,
    resetRoleConfig: () => {
      localStorage.removeItem(STORAGE_KEYS.ROLE_CONFIG);
      loadRoleConfig();
    }
  };

  // Initialize when DOM is ready
  const init = () => {
    loadRoleConfig();
    detectRole();
    applyRoleRestrictions();
    applyPresentationMode();
    
    // Trigger initialization event
    window.dispatchEvent(new CustomEvent('roleModeInitialized', { 
      detail: { role: currentRole, mode: currentMode } 
    }));
  };

  // Initialize immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

})();