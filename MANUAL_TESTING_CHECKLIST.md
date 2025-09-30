# Manual Testing Checklist

## Pre-Test Setup (Clean State)

1. **Clear localStorage**:
   ```javascript
   localStorage.clear();
   ```

2. **Delete IndexedDB** (optional):
   ```javascript
   indexedDB.deleteDatabase('foundry-assets');
   ```

3. **Reload the page**: `Ctrl+Shift+R` (hard reload)

---

## Test Scenario 1: Upload and Set Logo Variants

### Steps:
1. Click **Admin** button (bottom right)
2. Navigate to **Assets** tab
3. Upload first logo (white-text for dark backgrounds):
   - Click "Choose File"
   - Select white-text logo PNG/SVG
   - Click "Upload"
   - Wait for confirmation: "Saved asset: [filename]"

4. Set as dark variant:
   - On the uploaded asset card, click **"Set as Dark (HTML)"**
   - Button text should change to **"Dark Logo ✓"**

5. Upload second logo (black-text for light backgrounds):
   - Click "Choose File"
   - Select black-text logo PNG/SVG
   - Click "Upload"
   - Wait for confirmation

6. Set as light variant:
   - On the second asset card, click **"Set as Light (PDF)"**
   - Button text should change to **"Light Logo ✓"**

### Expected Results:
- ✓ Both assets visible in asset grid
- ✓ Dark variant shows "Dark Logo ✓"
- ✓ Light variant shows "Light Logo ✓"
- ✓ No console errors

### Verification Commands:
```javascript
// Check config
const cfg = window.loadAdminConfig();
console.log('Dark variant ID:', cfg.company.logoAssetIdDark);
console.log('Light variant ID:', cfg.company.logoAssetIdLight);
console.log('Show in print:', cfg.branding.showLogoInPrint); // Should be true

// Check window.images
console.log('logoOnDark:', window.images.logoOnDark);
console.log('logoOnLight:', window.images.logoOnLight);
```

---

## Test Scenario 2: HTML Preview (Dark Theme)

### Steps:
1. Close Admin panel
2. Fill in some proposal data (optional):
   - Client Name: "Test Client"
   - Project Name: "Test Project"
3. Click **"Generate Proposal Preview"**

### Expected Results:
- ✓ Dark background color: #0B1120 (very dark blue)
- ✓ White text throughout the preview
- ✓ Header shows white-text logo (dark variant)
- ✓ Header scrolls with the page (NOT sticky)
- ✓ "PROPOSAL PREVIEW" text visible in header
- ✓ Three buttons visible: "Back to Editor", "Export HTML", "Print / Export PDF"
- ✓ No translucent overlay/backdrop visible

### Verification Commands:
```javascript
// Check theme
console.log('Has dark theme:', document.body.classList.contains('theme-html-dark')); // true
console.log('BG color:', window.getComputedStyle(document.body).backgroundColor); // rgb(11, 17, 32)

// Check header
const header = document.querySelector('.print-hidden');
console.log('Header position:', header.style.position); // "static"
console.log('Header visible:', window.getComputedStyle(header).display); // "flex"
```

### Visual Checks:
- [ ] Dark background is applied
- [ ] Text is readable (white on dark)
- [ ] White-text logo is displayed
- [ ] Header scrolls when you scroll the page
- [ ] No sticky header behavior

---

## Test Scenario 3: Export HTML

### Steps:
1. In preview mode, click **"Export HTML"**
2. Save the downloaded HTML file
3. Open the downloaded HTML in a new browser tab

### Expected Results:
- ✓ File downloads: `Test_Client_Proposal.html` (or similar)
- ✓ Opened file shows dark theme
- ✓ White-text logo is embedded (as data URL)
- ✓ All content is visible and styled correctly
- ✓ No external resource requests (all embedded)

### Verification:
```javascript
// In the exported HTML file, open dev tools and run:
console.log('Body classes:', document.body.className); 
// Should include: theme-html-dark

console.log('Logo src:', document.querySelector('.logo-clean')?.src);
// Should start with: data:image/...
```

### Visual Checks:
- [ ] Dark background preserved
- [ ] White-text logo visible
- [ ] All text is readable
- [ ] No broken images
- [ ] No console errors

---

## Test Scenario 4: Print / Export PDF

### Steps:
1. In preview mode, click **"Print / Export PDF"**
2. In the print dialog:
   - Verify preview shows white background
   - Verify black-text logo is shown
   - Click "Save as PDF" or "Print"

### Expected Results:
- ✓ Print preview shows WHITE background
- ✓ Black text throughout
- ✓ Black-text logo visible (light variant)
- ✓ UI elements hidden (buttons, inputs, etc.)
- ✓ Professional PDF layout

### After Print/Save:
- ✓ App returns to HTML preview
- ✓ Dark theme is restored
- ✓ White-text logo is back
- ✓ No visual glitches

### Verification Commands (before print):
```javascript
// During print (run quickly before clicking save/print):
console.log('Body classes:', document.body.className);
// Should include: theme-pdf-light

console.log('Active logo:', window.images.logo);
// Should be the light variant
```

### Visual Checks (in print preview):
- [ ] White background
- [ ] Black text (readable)
- [ ] Black-text logo visible
- [ ] No UI elements (buttons, inputs)
- [ ] Clean professional layout

---

## Test Scenario 5: Backdrop Behavior

### Steps:
1. Go back to editor mode
2. Click **"Admin"** to open panel
3. Observe backdrop (semi-transparent overlay)
4. Click backdrop (outside modal) to close
5. Verify backdrop disappears

### Expected Results:
- ✓ Backdrop visible when admin panel open
- ✓ Backdrop dims the background content
- ✓ Clicking backdrop closes the modal
- ✓ Backdrop hidden when modal closed
- ✓ No backdrop visible in editor or preview mode

### Verification Commands:
```javascript
// With modal OPEN:
console.log('Modal open:', document.body.classList.contains('modal-open')); // true
const backdrop = document.querySelector('.admin-modal-backdrop');
console.log('Backdrop display:', window.getComputedStyle(backdrop).display); // "block"

// With modal CLOSED:
console.log('Modal open:', document.body.classList.contains('modal-open')); // false
console.log('Backdrop display:', window.getComputedStyle(backdrop).display); // "none"
```

### Visual Checks:
- [ ] Backdrop only shows when admin panel is open
- [ ] No backdrop in editor mode
- [ ] No backdrop in preview mode
- [ ] Backdrop properly dims background
- [ ] Clicking backdrop closes modal

---

## Test Scenario 6: Cross-Browser Testing

### Chrome Desktop
- [ ] All features work
- [ ] Dark theme renders correctly
- [ ] PDF export works
- [ ] Export HTML works
- [ ] Logo variants display correctly

### Safari Desktop
- [ ] All features work
- [ ] IndexedDB assets save/load
- [ ] Theme switching works
- [ ] PDF export works
- [ ] Export HTML works

### Safari iPad
- [ ] Admin panel opens
- [ ] File upload works
- [ ] Logo variants can be set
- [ ] Preview works
- [ ] Export functions work

---

## Test Scenario 7: API Testing

### Run in Console:
```javascript
// 1. Check all APIs are exposed
console.log('APIs:', {
  assetToDataURL: typeof window.assetToDataURL,
  putAsset: typeof window.putAsset,
  listAssets: typeof window.listAssets,
  deleteAsset: typeof window.deleteAsset,
  setDefaultLogoVariant: typeof window.setDefaultLogoVariant,
  hydrateLogosFromAdminConfig: typeof window.hydrateLogosFromAdminConfig,
  loadAdminConfig: typeof window.loadAdminConfig,
  exportProposal: typeof window.exportProposal,
  printProposal: typeof window.printProposal
});
// All should be "function"

// 2. List assets
const assets = await window.listAssets();
console.log('Assets:', assets);

// 3. Get config
const config = window.loadAdminConfig();
console.log('Config:', config);

// 4. Check images
console.log('Images:', {
  logo: window.images.logo?.substring(0, 50) + '...',
  logoOnDark: window.images.logoOnDark?.substring(0, 50) + '...',
  logoOnLight: window.images.logoOnLight?.substring(0, 50) + '...'
});
```

---

## Test Scenario 8: Edge Cases

### Empty State (No Logos Uploaded):
1. Clear localStorage and reload
2. Go to preview
3. Verify: Fallback SVG logo is shown
4. Export HTML/PDF still works

### Single Logo Variant:
1. Upload and set only dark variant
2. Go to preview: Dark variant should show
3. Export PDF: Should use dark variant (best available)

### Logo Delete:
1. Upload logo
2. Set as variant
3. Delete the asset (if delete button exists)
4. Verify: Logo reverts to fallback

---

## Acceptance Checklist

All items must be checked before closing the issue:

- [ ] Admin reliably stores assets in IndexedDB
- [ ] `assetToDataURL(id)` resolves asset:<id> to data URL
- [ ] `setDefaultLogoVariant('dark'|'light', assetId)` updates config and window.images
- [ ] `hydrateLogosFromAdminConfig()` syncs logos on load
- [ ] HTML preview uses dark theme (#0B1120 background)
- [ ] Header scrolls with page (position: static)
- [ ] White-text logo shown in HTML preview
- [ ] Export HTML works and preserves dark theme
- [ ] PDF export yields white background and black text
- [ ] Black-text logo shown in PDF export
- [ ] Export PDF button works
- [ ] No unwanted translucent overlay in preview
- [ ] Backdrop only shows when modal open (body.modal-open)
- [ ] No console errors at load or during export
- [ ] Cross-browser tested (Chrome, Safari)
- [ ] scott-a11y has explicitly confirmed all criteria

---

## Known Issues / Limitations

None identified during implementation.

---

## Sign-Off

**Tester Name**: _________________

**Date**: _________________

**Result**: [ ] PASS  [ ] FAIL

**Notes**:
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**Status: READY FOR VERIFICATION**

Awaiting scott-a11y explicit confirmation before closing issue/PR.
