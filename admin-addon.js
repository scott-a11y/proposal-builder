/* Admin Console + Asset Library (IndexedDB) for proposal-builder
   - Safe, non-breaking: only applies when settings exist
   - Persistent assets (logo, renders) across sessions
   - Default logo support via admin settings
   - Export/import settings and assets (offline)
*/
(() => {
  'use strict';

  // ----- Config keys -----
  const LS_ADMIN = 'foundry-admin-config';
  const DB_NAME = 'foundry-assets';
  const DB_VERSION = 1;
  const STORE_ASSETS = 'assets';

  // ----- Admin state helpers -----
  const defaultAdminConfig = () => ({
    version: 1,
    company: {
      name: 'Foundry Cabinet Co',
      email: 'info@foundrycabinetco.com',
      phone: '',
      address: '',
      website: '',
      logoAssetId: '' // if set, images.logo => asset:<id>
    },
    templates: {},
    defaults: {
      emailRecipient: 'info@foundrycabinetco.com',
      currencySymbol: '$',
      dateFormat: 'YYYY-MM-DD'
    },
    pin: ''
  });

  const loadAdminConfig = () => {
    try {
      const raw = localStorage.getItem(LS_ADMIN);
      if (!raw) return defaultAdminConfig();
      const parsed = JSON.parse(raw);
      return deepMerge(defaultAdminConfig(), parsed);
    } catch {
      return defaultAdminConfig();
    }
  };

  const saveAdminConfig = (cfg) => {
    localStorage.setItem(LS_ADMIN, JSON.stringify(cfg));
    try {
      localStorage.setItem(`${LS_ADMIN}-backup-${Date.now()}`, JSON.stringify(cfg));
    } catch {}
  };

  const deepMerge = (base, override) => {
    if (Array.isArray(base)) return override ?? base;
    if (typeof base === 'object' && base) {
      const out = { ...base };
      for (const k of Object.keys(override || {})) {
        out[k] = deepMerge(base[k], override[k]);
      }
      return out;
    }
    return override ?? base;
  };

  // ----- IndexedDB helpers -----
  const openDB = () =>
    new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_ASSETS)) {
          const store = db.createObjectStore(STORE_ASSETS, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });

  const txStore = async (mode = 'readonly') => {
    const db = await openDB();
    const tx = db.transaction(STORE_ASSETS, mode);
    return { db, store: tx.objectStore(STORE_ASSETS), tx };
  };

  const hashBlob = async (blob) => {
    const buf = await blob.arrayBuffer();
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const saveAsset = async (file) => {
    const id = await hashBlob(file);
    const { store, tx, db } = await txStore('readwrite');
    return new Promise((resolve, reject) => {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (getReq.result) {
          db.close();
          resolve(getReq.result);
        } else {
          const rec = {
            id,
            name: file.name || `asset-${id.slice(0, 8)}`,
            type: file.type || 'application/octet-stream',
            size: file.size || 0,
            createdAt: Date.now(),
            blob: file
          };
          const putReq = store.put(rec);
          putReq.onsuccess = () => { db.close(); resolve(rec); };
          putReq.onerror = () => { db.close(); reject(putReq.error); };
        }
      };
      getReq.onerror = () => { db.close(); reject(getReq.error); };
    });
  };

  const getAsset = async (id) => {
    const { store, db } = await txStore('readonly');
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => { db.close(); resolve(req.result || null); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  };

  const listAssets = async () => {
    const { store, db } = await txStore('readonly');
    return new Promise((resolve, reject) => {
      const items = [];
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) { items.push(cursor.value); cursor.continue(); }
        else { db.close(); items.sort((a, b) => b.createdAt - a.createdAt); resolve(items); }
      };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  };

  const assetToDataURL = async (id) => {
    console.log('[Asset] Resolving asset ID:', id);
    const rec = await getAsset(id);
    if (!rec) {
      console.warn('[Asset] Asset not found in IndexedDB:', id);
      return '';
    }
    const blob = rec.blob;
    console.log('[Asset] Found asset, converting to data URL:', rec.name, rec.type, rec.size + ' bytes');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result || '';
        console.log('[Asset] Conversion complete, data URL length:', result.length);
        resolve(result);
      };
      reader.readAsDataURL(blob);
    });
  };
  
  // Expose globally for use by main application
  window.assetToDataURL = assetToDataURL;

  // ----- Hook into app image pipeline (asset: scheme) -----
  const hookAssetScheme = () => {
    if (typeof window.toDataURL !== 'function') return;
    const originalToDataURL = window.toDataURL;

    window.toDataURL = async (src) => {
      try {
        if (src && typeof src === 'string' && src.startsWith('asset:')) {
          const id = src.slice('asset:'.length);
          console.log('[Asset Hook] Intercepting asset: URL for resolution:', id);
          return await assetToDataURL(id);
        }
      } catch (e) {
        console.warn('[Asset Hook] Asset resolution failed:', e);
      }
      return originalToDataURL(src);
    };
  };

  // ----- Apply default logo if set -----
  const applyDefaultLogoIfPresent = async () => {
    try {
      const cfg = loadAdminConfig();
      const logoId = cfg.company?.logoAssetId;
      if (logoId && typeof window.images === 'object') {
        window.images.logo = `asset:${logoId}`;
        // Auto-enable logo in print when admin logo is configured
        if (typeof window.printConfig === 'object') {
          window.printConfig.showLogoInPrint = true;
        }
        if (typeof window.renderApp === 'function') {
          try { window.renderApp(); } catch {}
        }
      }
    } catch {}
  };

  // ----- Admin UI -----
  const css = `
  .admin-fab { background: #000; color: #fff; border: 1px solid #000; border-radius: 999px; padding: 10px 16px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; z-index: 1000; position: relative; }
  /* Backdrop only shows when body.modal-open is set */
  .admin-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 10000; display: none; }
  .admin-modal { position: fixed; inset: 5% 5% auto 5%; background: #fff; border: 1px solid #ddd; z-index: 10001; display: none; max-width: 960px; margin: 0 auto; border-radius: 6px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
  .admin-head { display:flex; align-items:center; justify-content:space-between; padding: 12px 16px; border-bottom:1px solid #eee; background:#fafafa; }
  .admin-tabs { display:flex; gap: 12px; padding: 12px 16px; border-bottom:1px solid #eee; background:#fcfcfc; }
  .admin-tab { padding: 8px 12px; border: 1px solid #ddd; background:#fff; cursor:pointer; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  .admin-tab.active { background:#000; color:#fff; border-color:#000; }
  .admin-body { padding: 16px; max-height: 70vh; overflow:auto; }
  .admin-row { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .admin-field label { display:block; font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
  .admin-field input, .admin-field textarea { width:100%; border: 1px solid #e5e7eb; padding:10px; font-size:13px; }
  .admin-actions { display:flex; gap: 8px; margin-top: 12px; }
  .btn { border:1px solid #000; background:#fff; color:#000; padding:8px 12px; cursor:pointer; text-transform:uppercase; font-size:11px; letter-spacing:1px; }
  .btn.primary { background:#000; color:#fff; }
  .asset-grid { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px; }
  .asset-card { border:1px solid #e5e7eb; padding:10px; }
  .asset-card img { display:block; width:100%; height:140px; object-fit:contain; background:#fafafa; border:1px solid #eee; }
  .asset-meta { font-size:11px; color:#555; margin:6px 0; }
  .template-form-input { margin-bottom: 8px !important; }
  @media (max-width: 768px) { .admin-row { grid-template-columns: 1fr; } .asset-grid { grid-template-columns: 1fr 1fr; } }
  `;

  const injectStyles = () => {
    // Try multiple ways to inject styles safely
    const tag = document.createElement('style');
    tag.textContent = css;
    
    if (document.head) {
      document.head.appendChild(tag);
    } else if (document.getElementsByTagName('head')[0]) {
      document.getElementsByTagName('head')[0].appendChild(tag);
    } else if (document.documentElement) {
      document.documentElement.appendChild(tag);
    } else {
      console.warn('No suitable location found for style injection');
    }
  };

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (v !== undefined && v !== null) node.setAttribute(k, String(v));
    });
    children.forEach((c) => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
  };

  const formatBytes = (n) => {
    if (!n && n !== 0) return '';
    const units = ['B','KB','MB','GB'];
    let i = 0, size = n;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(1)} ${units[i]}`;
  };

  const ui = {
    backdrop: null,
    modal: null,
    tabs: { assets: null, company: null, templates: null, data: null },
    body: null,
    state: { active: 'assets', assets: [] }
  };

  const openAdmin = async () => {
    await refreshAssets();
    renderActiveTab(ui.state.active);
    ui.backdrop.style.display = 'block';
    ui.modal.style.display = 'block';
    // Add body class to manage modal state and prevent backdrop from affecting preview
    document.body.classList.add('modal-open');
  };

  const closeAdmin = () => {
    ui.backdrop.style.display = 'none';
    ui.modal.style.display = 'none';
    // Remove body class to restore normal state
    document.body.classList.remove('modal-open');
  };

  const buildUI = () => {
    injectStyles();

    const fab = el('button', { class: 'admin-fab', onclick: openAdmin }, ['Admin']);
    const backdrop = el('div', { class: 'admin-modal-backdrop', onclick: closeAdmin });
    const modal = el('div', { class: 'admin-modal' }, [
      el('div', { class: 'admin-head' }, [
        el('div', {}, [el('strong', {}, ['Admin Console'])]),
        el('div', {}, [ el('button', { class: 'btn', onclick: closeAdmin }, ['Close']) ])
      ]),
      el('div', { class: 'admin-tabs' }, [
        tabButton('assets', 'Assets'),
        tabButton('company', 'Company'),
        tabButton('templates', 'Templates'),
        tabButton('data', 'Data')
      ]),
      (ui.body = el('div', { class: 'admin-body' }))
    ]);

    ui.backdrop = backdrop;
    ui.modal = modal;
    
    // Use shared floating button container for the admin fab button
    const getContainer = () => {
      if (window.shareLink?.getOrCreateFloatingButtonContainer) {
        return window.shareLink.getOrCreateFloatingButtonContainer();
      }
      // Fallback if shareLink isn't available yet
      return document.body;
    };
    
    // Try multiple ways to append UI elements safely
    const container = getContainer();
    if (container && container.appendChild) {
      if (container.id === 'floating-buttons-container') {
        container.appendChild(fab);
      } else if (document.body) {
        document.body.appendChild(fab);
      }
      if (document.body) {
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
      }
    } else if (document.getElementsByTagName('body')[0]) {
      const body = document.getElementsByTagName('body')[0];
      body.appendChild(fab);
      body.appendChild(backdrop);
      body.appendChild(modal);
    } else if (document.documentElement) {
      document.documentElement.appendChild(fab);
      document.documentElement.appendChild(backdrop);
      document.documentElement.appendChild(modal);
    } else {
      console.warn('No suitable location found for UI injection');
    }
  };

  const tabButton = (key, label) => {
    const btn = el('button', {
      class: `admin-tab ${ui.state.active === key ? 'active' : ''}`,
      onclick: () => { ui.state.active = key; renderActiveTab(key); }
    }, [label]);
    ui.tabs[key] = btn;
    return btn;
  };

  const setActiveTab = (key) => {
    ui.state.active = key;
    Object.entries(ui.tabs).forEach(([k, b]) => {
      if (!b) return;
      b.classList.toggle('active', k === key);
    });
  };

  const renderActiveTab = (key) => {
    setActiveTab(key);
    ui.body.innerHTML = '';
    if (key === 'assets') renderAssetsTab();
    else if (key === 'company') renderCompanyTab();
    else if (key === 'templates') renderTemplatesTab();
    else if (key === 'data') renderDataTab();
  };

  // ---- Assets Tab ----
  const refreshAssets = async () => {
    ui.state.assets = await listAssets();
  };

  const renderAssetsTab = () => {
    const uploadRow = el('div', { class: 'admin-actions' }, [
      el('input', { type: 'file', id: 'assetFile', accept: 'image/*' }, []),
      el('button', {
        class: 'btn primary',
        onclick: async () => {
          const input = document.getElementById('assetFile');
          const file = input?.files?.[0];
          if (!file) { alert('Choose an image'); return; }
          const rec = await saveAsset(file);
          await refreshAssets();
          renderActiveTab('assets');
          alert(`Saved asset: ${rec.name}`);
        }
      }, ['Upload'])
    ]);

    const grid = el('div', { class: 'asset-grid' });
    const cfg = loadAdminConfig();

    ui.state.assets.forEach((a) => {
      const imgEl = el('img', { alt: a.name });
      assetToDataURL(a.id).then((dataURL) => { imgEl.src = dataURL; });

      const isDefault = cfg.company.logoAssetId === a.id;
      const card = el('div', { class: 'asset-card' }, [
        imgEl,
        el('div', { class: 'asset-meta' }, [`${a.name} • ${formatBytes(a.size)}`]),
        el('div', { class: 'admin-actions' }, [
          el('button', {
            class: `btn ${isDefault ? '' : 'primary'}`,
            onclick: () => {
              const c = loadAdminConfig();
              c.company.logoAssetId = a.id;
              saveAdminConfig(c);
              if (typeof window.images === 'object') {
                window.images.logo = `asset:${a.id}`;
              }
              // Auto-enable logo in print when admin logo is set
              if (typeof window.printConfig === 'object') {
                window.printConfig.showLogoInPrint = true;
              }
              if (typeof window.renderApp === 'function') {
                try { window.renderApp(); } catch {}
              }
              renderActiveTab('assets');
            }
          }, [isDefault ? 'Default Logo ✓' : 'Use as Default Logo'])
        ])
      ]);
      grid.appendChild(card);
    });

    ui.body.appendChild(uploadRow);
    ui.body.appendChild(el('div', { style: { height: '8px' } }, []));
    ui.body.appendChild(grid);
  };

  // ---- Company Tab ----
  const renderCompanyTab = () => {
    const cfg = loadAdminConfig();

    const nameI = inputField('Company Name', cfg.company.name, (v) => { cfg.company.name = v; });
    const emailI = inputField('Email', cfg.company.email, (v) => { cfg.company.email = v; });
    const phoneI = inputField('Phone', cfg.company.phone, (v) => { cfg.company.phone = v; });
    const addrI = inputField('Address', cfg.company.address, (v) => { cfg.company.address = v; });
    const webI  = inputField('Website', cfg.company.website, (v) => { cfg.company.website = v; });

    const currentLogo = el('div', {}, [
      el('div', { class: 'admin-field' }, [
        el('label', {}, ['Current Default Logo']),
        (() => {
          const holder = el('div', {});
          const id = cfg.company.logoAssetId;
          if (id) {
            const img = el('img', { alt: 'Default Logo', style: { width: '240px', height: '120px', objectFit: 'contain', border: '1px solid #eee', background: '#fafafa' } });
            assetToDataURL(id).then((url) => { img.src = url || ''; });
            holder.appendChild(img);
          } else {
            holder.appendChild(el('div', { class: 'asset-meta' }, ['No default logo set']));
          }
          return holder;
        })()
      ])
    ]);

    const saveBtn = el('button', {
      class: 'btn primary',
      onclick: () => {
        saveAdminConfig(cfg);
        alert('Company settings saved');
        applyDefaultLogoIfPresent();
      }
    }, ['Save']);

    ui.body.appendChild(el('div', { class: 'admin-row' }, [
      el('div', {}, [nameI, emailI, phoneI]),
      el('div', {}, [addrI, webI, currentLogo])
    ]));
    ui.body.appendChild(el('div', { class: 'admin-actions' }, [saveBtn]));
  };

  // ---- Templates Tab ----
  const renderTemplatesTab = () => {
    const cfg = loadAdminConfig();
    
    // Create new template form
    const createTemplateSection = el('div', { class: 'admin-field', style: { marginBottom: '24px' } }, [
      el('label', {}, ['Create New Template']),
      el('div', { class: 'admin-row', style: { marginTop: '12px' } }, [
        el('div', {}, [
          el('input', { 
            id: 'newTemplateName', 
            placeholder: 'Template Name (e.g., bathroom-basic)', 
            class: 'template-form-input'
          }),
          el('input', { 
            id: 'newTemplateTitle', 
            placeholder: 'Display Title (e.g., Bathroom Basic)', 
            class: 'template-form-input'
          }),
          el('input', { 
            id: 'newTemplateTimeline', 
            placeholder: 'Timeline (e.g., 3-4 weeks)', 
            class: 'template-form-input'
          })
        ]),
        el('div', {}, [
          el('textarea', { 
            id: 'newTemplateDescription', 
            placeholder: 'Project description...', 
            style: { height: '80px' },
            class: 'template-form-input'
          }),
          el('textarea', { 
            id: 'newTemplateNotes', 
            placeholder: 'Additional notes...', 
            style: { height: '60px' },
            class: 'template-form-input'
          })
        ])
      ]),
      el('div', { class: 'admin-actions', style: { marginTop: '12px' } }, [
        el('button', {
          class: 'btn primary',
          onclick: () => createTemplate()
        }, ['Create Template'])
      ])
    ]);

    // List existing templates
    const templatesSection = el('div', {}, [
      el('label', { style: { display: 'block', marginBottom: '12px' } }, ['Existing Templates'])
    ]);

    const templatesList = el('div', { class: 'admin-field' });
    
    // Show both built-in and custom templates
    const builtInTemplates = {
      'kitchen-basic': { title: 'Kitchen Basic', builtin: true },
      'kitchen-premium': { title: 'Kitchen Premium', builtin: true },
      'vanity-euro': { title: 'Euro Vanity', builtin: true }
    };

    Object.entries(builtInTemplates).forEach(([key, template]) => {
      const templateCard = el('div', { 
        class: 'asset-card', 
        style: { marginBottom: '12px', backgroundColor: '#f8f9fa' } 
      }, [
        el('div', { style: { fontWeight: 'bold', marginBottom: '4px' } }, [template.title]),
        el('div', { class: 'asset-meta' }, ['Built-in Template']),
        el('div', { class: 'admin-actions' }, [
          el('button', { class: 'btn', disabled: true }, ['Built-in'])
        ])
      ]);
      templatesList.appendChild(templateCard);
    });

    Object.entries(cfg.templates || {}).forEach(([key, template]) => {
      const templateCard = el('div', { class: 'asset-card', style: { marginBottom: '12px' } }, [
        el('div', { style: { fontWeight: 'bold', marginBottom: '4px' } }, [template.title || key]),
        el('div', { class: 'asset-meta' }, [`Timeline: ${template.timeline || 'Not specified'}`]),
        el('div', { style: { fontSize: '12px', marginBottom: '8px' } }, [
          (template.description || '').substring(0, 100) + (template.description?.length > 100 ? '...' : '')
        ]),
        el('div', { class: 'admin-actions' }, [
          el('button', {
            class: 'btn',
            onclick: () => editTemplate(key, template)
          }, ['Edit']),
          el('button', {
            class: 'btn',
            onclick: () => deleteTemplate(key),
            style: { backgroundColor: '#dc3545', color: 'white', borderColor: '#dc3545' }
          }, ['Delete'])
        ])
      ]);
      templatesList.appendChild(templateCard);
    });

    if (Object.keys(cfg.templates || {}).length === 0) {
      templatesList.appendChild(el('div', { class: 'asset-meta', style: { textAlign: 'center', padding: '20px' } }, 
        ['No custom templates created yet. Use the form above to create your first template.']
      ));
    }

    templatesSection.appendChild(templatesList);

    ui.body.appendChild(createTemplateSection);
    ui.body.appendChild(templatesSection);
  };

  const createTemplate = () => {
    const nameInput = ui.body.querySelector('#newTemplateName');
    const titleInput = ui.body.querySelector('#newTemplateTitle');
    const timelineInput = ui.body.querySelector('#newTemplateTimeline');
    const descriptionInput = ui.body.querySelector('#newTemplateDescription');
    const notesInput = ui.body.querySelector('#newTemplateNotes');

    const name = nameInput?.value?.trim();
    const title = titleInput?.value?.trim();
    const timeline = timelineInput?.value?.trim();
    const description = descriptionInput?.value?.trim();
    const notes = notesInput?.value?.trim();

    if (!name || !title || !description) {
      alert('Please fill in Template Name, Display Title, and Description');
      return;
    }

    // Validate template name (should be lowercase with hyphens)
    if (!/^[a-z0-9-]+$/.test(name)) {
      alert('Template name should only contain lowercase letters, numbers, and hyphens');
      return;
    }

    const cfg = loadAdminConfig();
    if (!cfg.templates) cfg.templates = {};

    // Check if template already exists
    if (cfg.templates[name]) {
      if (!confirm(`Template '${name}' already exists. Do you want to overwrite it?`)) {
        return;
      }
    }

    cfg.templates[name] = {
      title,
      description,
      notes: notes || '',
      timeline: timeline || ''
    };

    saveAdminConfig(cfg);
    
    // Clear form
    if (nameInput) nameInput.value = '';
    if (titleInput) titleInput.value = '';
    if (timelineInput) timelineInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (notesInput) notesInput.value = '';

    // Refresh templates tab and update main app
    renderActiveTab('templates');
    updateMainAppTemplates();
    
    alert(`Template '${title}' created successfully!`);
  };

  const editTemplate = (key, template) => {
    const newTitle = prompt('Display Title:', template.title || key);
    if (newTitle === null) return;

    const newTimeline = prompt('Timeline:', template.timeline || '');
    if (newTimeline === null) return;

    const newDescription = prompt('Description:', template.description || '');
    if (newDescription === null) return;

    const newNotes = prompt('Notes:', template.notes || '');
    if (newNotes === null) return;

    const cfg = loadAdminConfig();
    cfg.templates[key] = {
      title: newTitle.trim() || key,
      description: newDescription.trim(),
      notes: newNotes.trim(),
      timeline: newTimeline.trim()
    };

    saveAdminConfig(cfg);
    renderActiveTab('templates');
    updateMainAppTemplates();
    
    alert('Template updated successfully!');
  };

  const deleteTemplate = (key) => {
    if (!confirm(`Are you sure you want to delete the template '${key}'?`)) {
      return;
    }

    const cfg = loadAdminConfig();
    if (cfg.templates && cfg.templates[key]) {
      delete cfg.templates[key];
      saveAdminConfig(cfg);
      renderActiveTab('templates');
      updateMainAppTemplates();
      alert('Template deleted successfully!');
    }
  };

  const updateMainAppTemplates = () => {
    // Notify main app to refresh templates
    if (typeof window.refreshTemplates === 'function') {
      try {
        window.refreshTemplates();
      } catch (e) {
        console.log('Could not refresh main app templates:', e);
      }
    }
    
    // Re-render main app if function exists
    if (typeof window.renderApp === 'function') {
      try {
        window.renderApp();
      } catch (e) {
        console.log('Could not re-render main app:', e);
      }
    }
  };

  const inputField = (labelText, value, onChange) => {
    const input = el('input', { value: value || '' });
    input.addEventListener('input', () => onChange(input.value));
    return el('div', { class: 'admin-field' }, [
      el('label', {}, [labelText]),
      input
    ]);
  };

  // ---- Data Tab ----
  const renderDataTab = () => {
    const expSettingsBtn = el('button', {
      class: 'btn',
      onclick: () => {
        const cfg = loadAdminConfig();
        downloadJSON(cfg, `foundry-admin-config-${new Date().toISOString().slice(0,10)}.json`);
      }
    }, ['Export Settings']);

    const expAllBtn = el('button', {
      class: 'btn',
      onclick: async () => {
        const cfg = loadAdminConfig();
        const assets = await listAssets();
        const payload = {
          settings: cfg,
          assets: await Promise.all(assets.map(async (a) => ({
            id: a.id, name: a.name, type: a.type, size: a.size, createdAt: a.createdAt,
            dataURL: await assetToDataURL(a.id)
          })))
        };
        downloadJSON(payload, `foundry-admin-backup-${new Date().toISOString().slice(0,10)}.json`);
      }
    }, ['Export Settings + Assets']);

    const impInput = el('input', { type: 'file', accept: 'application/json' });
    const impBtn = el('button', {
      class: 'btn primary',
      onclick: async () => {
        const f = impInput.files?.[0];
        if (!f) { alert('Choose a JSON file to import'); return; }
        const text = await f.text();
        const payload = JSON.parse(text);
        if (payload.settings) {
          saveAdminConfig(payload.settings);
        } else {
          saveAdminConfig(payload);
        }
        if (payload.assets && Array.isArray(payload.assets)) {
          for (const a of payload.assets) {
            if (!a?.dataURL) continue;
            const blob = dataURLtoBlob(a.dataURL);
            const file = new File([blob], a.name || `asset-${a.id}.bin`, { type: a.type || blob.type });
            await saveAsset(file);
          }
        }
        await refreshAssets();
        alert('Import completed');
        renderActiveTab('data');
        applyDefaultLogoIfPresent();
      }
    }, ['Import']);

    const resetBtn = el('button', {
      class: 'btn',
      onclick: () => {
        if (!confirm('Reset admin settings? Assets remain stored.')) return;
        saveAdminConfig(defaultAdminConfig());
        alert('Settings reset');
        applyDefaultLogoIfPresent();
      }
    }, ['Reset Settings']);

    ui.body.appendChild(el('div', { class: 'admin-actions' }, [expSettingsBtn, expAllBtn]));
    ui.body.appendChild(el('div', { style: { height: '12px' } }, []));
    ui.body.appendChild(el('div', { class: 'admin-actions' }, [impInput, impBtn]));
    ui.body.appendChild(el('div', { style: { height: '12px' } }, []));
    ui.body.appendChild(el('div', { class: 'admin-actions' }, [resetBtn]));
  };

  const downloadJSON = (obj, filename) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    
    // Try multiple ways to append download link safely
    if (document.body) {
      document.body.appendChild(a);
    } else if (document.getElementsByTagName('body')[0]) {
      document.getElementsByTagName('body')[0].appendChild(a);
    } else if (document.documentElement) {
      document.documentElement.appendChild(a);
    } else {
      console.warn('No suitable location found for download operation');
      URL.revokeObjectURL(url);
      return;
    }
    
    a.click(); 
    a.remove();
    URL.revokeObjectURL(url);
  };

  const dataURLtoBlob = (dataURL) => {
    const [meta, b64] = dataURL.split(',');
    const mimeMatch = meta.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bin = atob(b64 || '');
    const len = bin.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
    return new Blob([u8], { type: mime });
  };

  // ----- Bootstrapping -----
  const init = async () => {
    hookAssetScheme();
    buildUI();
    const ensureImages = () => typeof window.images === 'object';
    if (ensureImages()) {
      await applyDefaultLogoIfPresent();
    } else {
      const t0 = Date.now();
      const tryLater = () => {
        if (ensureImages() || Date.now() - t0 > 3000) {
          applyDefaultLogoIfPresent();
        } else {
          setTimeout(tryLater, 150);
        }
      };
      tryLater();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();