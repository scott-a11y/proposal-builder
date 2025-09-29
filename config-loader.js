/* Config-loader.js - Configuration management for Foundry Cabinet Co
   Handles loading and merging of various configuration sources
   Integrates with existing admin system and role-based access
*/

(() => {
  'use strict';

  // Configuration keys
  const CONFIG_KEYS = {
    ADMIN: 'foundry-admin-config',
    PRESENTATION: 'foundry-presentation-config',
    ROLE: 'foundry-role-config',
    FEATURE_FLAGS: 'foundry-feature-flags'
  };

  // Default configurations
  const defaultConfigs = {
    presentation: {
      showLogo: true,
      showRoleIndicator: false,
      autoHideUI: true,
      transitionDuration: '0.5s',
      headerStyle: 'minimal',
      footerInfo: true,
      qrCodeSize: 128
    },
    
    features: {
      roleGating: true,
      presentationMode: true,
      shareLinks: true,
      adminGuard: true,
      exportControls: true
    },
    
    branding: {
      companyName: 'Foundry Cabinet Co',
      primaryColor: '#0B1120',
      accentColor: '#F59E0B',
      logoUrl: '',
      websiteUrl: '',
      contactEmail: 'info@foundrycabinetco.com'
    }
  };

  // Configuration state
  let loadedConfigs = {};
  let isInitialized = false;

  // Load configuration from localStorage with fallbacks
  const loadConfig = (key, defaultConfig) => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultConfig;
      
      const parsed = JSON.parse(stored);
      return deepMerge(defaultConfig, parsed);
    } catch (e) {
      console.warn(`Failed to load config for ${key}:`, e);
      return defaultConfig;
    }
  };

  // Save configuration to localStorage
  const saveConfig = (key, config) => {
    try {
      localStorage.setItem(key, JSON.stringify(config));
      return true;
    } catch (e) {
      console.warn(`Failed to save config for ${key}:`, e);
      return false;
    }
  };

  // Deep merge utility
  const deepMerge = (base, override) => {
    if (Array.isArray(base)) return override ?? base;
    if (typeof base === 'object' && base && !Array.isArray(base)) {
      const result = { ...base };
      for (const key of Object.keys(override || {})) {
        result[key] = deepMerge(base[key], override[key]);
      }
      return result;
    }
    return override ?? base;
  };

  // Load admin configuration (integrates with existing admin-addon.js)
  const loadAdminConfig = () => {
    const adminConfig = loadConfig(CONFIG_KEYS.ADMIN, {
      version: 1,
      company: {
        name: 'Foundry Cabinet Co',
        email: 'info@foundrycabinetco.com',
        phone: '',
        address: '',
        website: '',
        logoAssetId: ''
      },
      templates: {},
      defaults: {
        emailRecipient: 'info@foundrycabinetco.com',
        currencySymbol: '$',
        dateFormat: 'YYYY-MM-DD'
      },
      pin: ''
    });

    // Merge admin branding into global branding config
    if (adminConfig.company) {
      loadedConfigs.branding = deepMerge(loadedConfigs.branding, {
        companyName: adminConfig.company.name || loadedConfigs.branding.companyName,
        contactEmail: adminConfig.company.email || loadedConfigs.branding.contactEmail,
        websiteUrl: adminConfig.company.website || loadedConfigs.branding.websiteUrl
      });
    }

    return adminConfig;
  };

  // Initialize all configurations
  const initializeConfigs = () => {
    if (isInitialized) return;

    // Load base configurations
    loadedConfigs.presentation = loadConfig(CONFIG_KEYS.PRESENTATION, defaultConfigs.presentation);
    loadedConfigs.features = loadConfig(CONFIG_KEYS.FEATURE_FLAGS, defaultConfigs.features);
    loadedConfigs.branding = loadConfig('foundry-branding-config', defaultConfigs.branding);

    // Load and merge admin configuration
    loadedConfigs.admin = loadAdminConfig();

    // Apply feature flag overrides from URL
    applyUrlOverrides();

    isInitialized = true;
    
    // Trigger configuration loaded event
    window.dispatchEvent(new CustomEvent('configLoaded', { 
      detail: { configs: loadedConfigs } 
    }));
  };

  // Apply URL parameter overrides
  const applyUrlOverrides = () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Feature flag overrides
    const features = ['roleGating', 'presentationMode', 'shareLinks', 'adminGuard'];
    features.forEach(feature => {
      const override = urlParams.get(feature);
      if (override === 'true' || override === 'false') {
        loadedConfigs.features[feature] = override === 'true';
      }
    });

    // Presentation overrides
    const showLogo = urlParams.get('showLogo');
    if (showLogo === 'true' || showLogo === 'false') {
      loadedConfigs.presentation.showLogo = showLogo === 'true';
    }

    const showRoleIndicator = urlParams.get('showRoleIndicator');
    if (showRoleIndicator === 'true' || showRoleIndicator === 'false') {
      loadedConfigs.presentation.showRoleIndicator = showRoleIndicator === 'true';
    }
  };

  // Get configuration value with path notation
  const getConfig = (path, defaultValue = null) => {
    if (!isInitialized) {
      console.warn('Config not initialized, call initializeConfigs() first');
      return defaultValue;
    }

    const keys = path.split('.');
    let current = loadedConfigs;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }

    return current;
  };

  // Set configuration value with path notation
  const setConfig = (path, value) => {
    if (!isInitialized) {
      console.warn('Config not initialized, call initializeConfigs() first');
      return false;
    }

    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = loadedConfigs;

    // Navigate to the parent object
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;

    // Save the affected configuration
    const rootKey = keys[0] || path.split('.')[0];
    const configKey = Object.keys(CONFIG_KEYS).find(k => 
      CONFIG_KEYS[k].includes(rootKey) || rootKey === k.toLowerCase()
    );

    if (configKey && CONFIG_KEYS[configKey]) {
      return saveConfig(CONFIG_KEYS[configKey], loadedConfigs[rootKey]);
    }

    return false;
  };

  // Update entire configuration section
  const updateConfig = (section, newConfig) => {
    if (!isInitialized) {
      console.warn('Config not initialized, call initializeConfigs() first');
      return false;
    }

    if (loadedConfigs[section]) {
      loadedConfigs[section] = deepMerge(loadedConfigs[section], newConfig);
      
      // Save to appropriate storage key
      const configKey = Object.keys(CONFIG_KEYS).find(k => 
        k.toLowerCase() === section || CONFIG_KEYS[k].includes(section)
      );

      if (configKey && CONFIG_KEYS[configKey]) {
        return saveConfig(CONFIG_KEYS[configKey], loadedConfigs[section]);
      }
    }

    return false;
  };

  // Apply configuration to DOM/CSS
  const applyConfigToDOM = () => {
    if (!isInitialized) return;

    const root = document.documentElement;

    // Apply branding colors
    if (loadedConfigs.branding) {
      root.style.setProperty('--brand-primary', loadedConfigs.branding.primaryColor);
      root.style.setProperty('--brand-accent', loadedConfigs.branding.accentColor);
    }

    // Apply presentation settings
    if (loadedConfigs.presentation) {
      root.style.setProperty('--transition-duration', loadedConfigs.presentation.transitionDuration);
      
      if (!loadedConfigs.presentation.showLogo) {
        document.querySelectorAll('.brand-logo').forEach(logo => {
          logo.style.display = 'none';
        });
      }
    }

    // Apply feature flags as body classes
    if (loadedConfigs.features) {
      Object.entries(loadedConfigs.features).forEach(([feature, enabled]) => {
        document.body.classList.toggle(`feature-${feature}`, enabled);
      });
    }
  };

  // Validate configuration
  const validateConfig = (config, schema) => {
    // Basic validation - can be extended
    const errors = [];
    
    Object.entries(schema).forEach(([key, type]) => {
      if (config[key] === undefined) {
        errors.push(`Missing required config: ${key}`);
      } else if (typeof config[key] !== type && type !== 'any') {
        errors.push(`Invalid type for ${key}: expected ${type}, got ${typeof config[key]}`);
      }
    });

    return errors;
  };

  // Export configuration for backup
  const exportConfig = () => {
    if (!isInitialized) {
      console.warn('Config not initialized');
      return null;
    }

    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      configs: loadedConfigs
    };
  };

  // Import configuration from backup
  const importConfig = (configData) => {
    if (!configData || !configData.configs) {
      console.warn('Invalid config data for import');
      return false;
    }

    try {
      // Validate and merge imported configs
      Object.entries(configData.configs).forEach(([section, config]) => {
        if (loadedConfigs[section]) {
          loadedConfigs[section] = deepMerge(loadedConfigs[section], config);
          
          // Save to localStorage
          const configKey = Object.keys(CONFIG_KEYS).find(k => 
            k.toLowerCase() === section || CONFIG_KEYS[k].includes(section)
          );

          if (configKey && CONFIG_KEYS[configKey]) {
            saveConfig(CONFIG_KEYS[configKey], loadedConfigs[section]);
          }
        }
      });

      // Re-apply configurations
      applyConfigToDOM();
      
      // Trigger config updated event
      window.dispatchEvent(new CustomEvent('configUpdated', { 
        detail: { configs: loadedConfigs } 
      }));

      return true;
    } catch (e) {
      console.error('Failed to import config:', e);
      return false;
    }
  };

  // Public API
  window.configLoader = {
    // Initialization
    initialize: initializeConfigs,
    isInitialized: () => isInitialized,
    
    // Configuration access
    get: getConfig,
    set: setConfig,
    update: updateConfig,
    getAll: () => loadedConfigs,
    
    // DOM integration
    applyToDOM: applyConfigToDOM,
    
    // Import/Export
    export: exportConfig,
    import: importConfig,
    
    // Utilities
    validate: validateConfig,
    deepMerge,
    
    // Constants
    CONFIG_KEYS,
    defaults: defaultConfigs
  };

  // Auto-initialize when DOM is ready
  const autoInit = () => {
    initializeConfigs();
    applyConfigToDOM();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  } else {
    autoInit();
  }

})();