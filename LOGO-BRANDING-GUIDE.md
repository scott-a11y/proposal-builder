# Logo and Branding Control Guide

This guide explains how to control logo visibility and branding in the proposal-builder application.

## Default Behavior

By default, the application creates **unbranded client deliverables**:
- ✅ Client HTML exports have NO logos visible
- ✅ PDF exports have NO logos visible  
- ✅ Clean, professional appearance for client-facing documents

## Logo Sources

The application can display logos from several sources:

1. **DEFAULT_LOGO_PATH**: `./Foundry-Cabinetco-Logo-2-White-Text.png`
   - Primary logo file (currently returns 404 if not present)
   - White text version designed for dark backgrounds

2. **INLINE_FALLBACK_LOGO**: SVG data URL
   - Black background with white text
   - Used as fallback when primary logo fails to load
   - Embedded directly in JavaScript

3. **Admin-uploaded assets**: Via `admin-addon.js`
   - Custom logos uploaded through admin interface
   - Stored with `asset:<id>` format
   - Configurable via `adminConfig.company.logoAssetId`

4. **CSS background logos**: 
   - Any elements with `.proposal-header` class
   - Automatically removed in client/PDF views

## Enabling Logos

### Method 1: Developer Console
```javascript
// Enable logo for next print/export
window.printConfig.showLogoInPrint = true;

// Disable logo (default)
window.printConfig.showLogoInPrint = false;

// Quick toggle function
window.togglePrintLogo(true);  // enable
window.togglePrintLogo(false); // disable
```

### Method 2: Admin Configuration
If `admin-addon.js` is loaded:
```javascript
// Admin can configure branding
adminConfig.branding.showLogoInPrint = true;
```

### Method 3: URL Parameter (temporary)
```
http://localhost:8080/?logo=./path/to/custom-logo.png
```

## View Modes

The application uses CSS classes to control visibility:

- **`.client-view`**: Applied to exported HTML (unbranded by default)
- **`.pdf-view`**: Applied during print/PDF generation (unbranded by default)  
- **`.show-logo`**: Add this class to enable logo display

## Signature Section Behavior

- **Client HTML Export**: Digital signature form is visible and functional
- **PDF Export**: Signature form is hidden (read-only document)
- **Print Preview**: Signature form is hidden (clean PDF output)

## Testing Logo Functionality

```javascript
// Test logo visibility control
console.log('Current logo setting:', window.printConfig.showLogoInPrint);

// Enable logo and test
window.togglePrintLogo(true);
// Then use "Print / Export PDF" button

// Disable logo and test  
window.togglePrintLogo(false);
// Then use "Print / Export PDF" button
```

## Implementation Details

### CSS Selectors Used
- `.logo-clean` - Main logo images
- `img[alt*="Logo"]` - Any image with "Logo" in alt text
- `img[src*="logo"]` - Any image with "logo" in src path
- `.proposal-header` - Header elements with potential background logos

### Priority Order (when branding enabled)
1. Admin-uploaded logo (`asset:<id>`)
2. DEFAULT_LOGO_PATH file
3. INLINE_FALLBACK_LOGO (SVG)
4. No logo (if all fail)

## Upgrading from Previous Versions

If upgrading from a version that showed logos by default:

1. **Client deliverables are now unbranded by default** - this is intentional
2. To restore previous behavior: `window.printConfig.showLogoInPrint = true;`
3. Signature sections now appear in client HTML exports
4. Print/PDF outputs remain clean and professional

## Troubleshooting

**Logo not showing when enabled:**
- Check `window.printConfig.showLogoInPrint` returns `true`
- Verify logo file exists and is accessible
- Ensure `.show-logo` class is applied during print

**Signature section not visible:**
- Check exported HTML has `class="client-view"` on body
- Verify `.signature-block` elements are present in HTML
- CSS rule `.client-view .signature-block { display: block !important; }` should override print-hidden

**PDF shows unwanted elements:**
- Check print view uses `class="pdf-view"` 
- All interactive elements should be hidden with `.pdf-view` CSS rules