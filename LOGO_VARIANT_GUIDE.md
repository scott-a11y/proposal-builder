# Logo Variant System - Usage Guide

## Overview

The proposal builder now supports **two logo variants** for optimal display in different contexts:
- **Dark Variant** (white-text logo): For HTML preview and exported HTML with dark backgrounds
- **Light Variant** (black-text logo): For PDF export and print with white backgrounds

---

## Quick Start

### Step 1: Upload Logo Variants

1. Click the **Admin** button (bottom right)
2. Go to the **Assets** tab
3. Upload your white-text logo (for dark backgrounds):
   - Click "Choose File" → Select your white-text logo → Click "Upload"
4. Upload your black-text logo (for light backgrounds):
   - Click "Choose File" → Select your black-text logo → Click "Upload"

### Step 2: Set Logo Variants

On each uploaded asset, you'll see two buttons:
- **"Set as Dark (HTML)"** - Sets this as the white-text logo for HTML preview
- **"Set as Light (PDF)"** - Sets this as the black-text logo for PDF export

Click the appropriate button for each logo variant.

### Step 3: Verify

1. Close the Admin panel
2. Click **"Generate Proposal Preview"**
3. Verify:
   - Dark background with white text ✓
   - Header scrolls with the page ✓
   - White-text logo is displayed ✓
   - Export buttons are visible ✓

---

## Logo Behavior by Context

### HTML Preview (In-App)
- **Theme**: Dark (#0B1120 background)
- **Text Color**: White (#ffffff)
- **Logo Used**: Dark variant (white-text)
- **Header**: Scrolls with page (position: static)

### Export HTML
- **Theme**: Dark (preserved from preview)
- **Text Color**: White
- **Logo Used**: Dark variant (white-text)
- **File**: `{ClientName}_Proposal.html`

### Print / Export PDF
- **Theme**: Light (white background)
- **Text Color**: Black (#000000)
- **Logo Used**: Light variant (black-text)
- **Output**: PDF via browser print dialog

---

## API Reference

### JavaScript Functions

#### Set Logo Variant
```javascript
// Set dark variant (white-text logo for HTML)
await window.setDefaultLogoVariant('dark', assetId);

// Set light variant (black-text logo for PDF)
await window.setDefaultLogoVariant('light', assetId);
```

#### Hydrate Logos on Load
```javascript
// Automatically loads logo variants from config
await window.hydrateLogosFromAdminConfig();
```

#### Access Current Logos
```javascript
// Get current logos
console.log(window.images.logoOnDark);  // Dark variant
console.log(window.images.logoOnLight); // Light variant
console.log(window.images.logo);        // Active logo (context-dependent)
```

#### Asset Management
```javascript
// Upload asset
const asset = await window.putAsset(file, { name: 'My Logo', variant: 'dark' });

// List all assets
const assets = await window.listAssets();

// Delete asset
await window.deleteAsset(assetId);

// Convert asset to data URL
const dataUrl = await window.assetToDataURL(assetId);
```

---

## Admin Configuration

The logo variants are stored in `localStorage` under `foundry-admin-config`:

```javascript
{
  company: {
    logoAssetIdDark: 'abc123...',  // White-text logo
    logoAssetIdLight: 'def456...', // Black-text logo
    logoAssetId: ''                // Legacy (backward compat)
  },
  branding: {
    showLogoInPrint: true          // Auto-enabled when variants are set
  }
}
```

---

## Troubleshooting

### Logo Not Showing in Preview
1. Check if logo variant is set:
   ```javascript
   console.log(window.loadAdminConfig().company.logoAssetIdDark);
   ```
2. Verify asset exists in IndexedDB:
   ```javascript
   const assets = await window.listAssets();
   console.log(assets);
   ```
3. Manually trigger hydration:
   ```javascript
   await window.hydrateLogosFromAdminConfig();
   window.renderApp();
   ```

### Wrong Logo in PDF
- Ensure you've set the **light variant** (black-text logo):
  ```javascript
  await window.setDefaultLogoVariant('light', assetId);
  ```

### Dark Theme Not Applying
1. Check body class in preview:
   ```javascript
   console.log(document.body.classList.contains('theme-html-dark'));
   ```
2. Should return `true` in preview mode

### Backdrop Showing When It Shouldn't
1. Check modal state:
   ```javascript
   console.log(document.body.classList.contains('modal-open'));
   ```
2. Should only be `true` when Admin panel is open

---

## Logo Design Recommendations

### Dark Variant (for HTML)
- **Text Color**: White or very light (for dark backgrounds)
- **File Format**: PNG with transparency or SVG
- **Optimal Size**: 800x220px (max height 120px in preview)
- **Use Case**: HTML preview, Export HTML

### Light Variant (for PDF/Print)
- **Text Color**: Black or very dark (for white backgrounds)
- **File Format**: PNG with transparency or SVG
- **Optimal Size**: 800x220px (max height 100px in print)
- **Use Case**: Print/Export PDF

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Chromium (Desktop & Mobile)
- ✅ Safari (Desktop & iPad)
- ✅ Firefox (Desktop & Mobile)
- ✅ Edge (Desktop)

### Features Used
- IndexedDB (for asset storage)
- FileReader API (for image upload)
- CSS Variables (for theming)
- Print Media Queries (for PDF export)

All features are standard web APIs with broad browser support.

---

## Developer Notes

### Theme Classes
- `theme-html-dark`: Applied in HTML preview mode (dark background, white text)
- `theme-pdf-light`: Applied during PDF export (white background, black text)

### Header Behavior
- HTML Preview: `position: static` (scrolls with page)
- PDF Export: Static positioning maintained (print.css governs layout)

### Logo Resolution
1. Admin uploads logos to IndexedDB
2. User sets variants via `setDefaultLogoVariant()`
3. Config stored in localStorage
4. On load, `hydrateLogosFromAdminConfig()` syncs `window.images`
5. Context (preview/export) determines which variant is used

---

## Support

For issues or questions:
1. Check console for errors: `F12` → Console tab
2. Use browser console commands to inspect logo state (see Developer Console Commands section above)
3. Contact: scott-a11y

---

Last Updated: 2025-09-30
