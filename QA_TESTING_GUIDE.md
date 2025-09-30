# QA Testing Guide - Logo Export and Preview Fix

## Quick Test - Verify Fix Works

### Console Verification Commands
Open DevTools console and run these commands to verify the fix:

```javascript
// 1. Check logo state
console.log('Logo:', window.images?.logo?.substring(0, 100));

// 2. Check print config
console.log('Print Config:', window.printConfig);

// 3. Check if assetToDataURL is available
console.log('assetToDataURL available:', typeof window.assetToDataURL === 'function');

// 4. Check if logo should show in print
console.log('Should show logo:', window.shouldShowLogoInPrint?.());

// 5. Check body classes
console.log('Body classes:', document.body.className);
```

### Manual Testing with Toggle (No Upload Required)

To test logo visibility without uploading assets:

```javascript
// Enable logo in preview and export
window.printConfig.showLogoInPrint = true;
document.body.classList.add('show-logo');
window.renderApp();

// Generate preview to see logo
// Click "Generate Proposal Preview" button
```

### Full Workflow Test (Upload Logo)

1. **Open Application**: Navigate to `http://localhost:8080` or your deployment URL

2. **Access Admin Panel**: 
   - Click the "Admin" button (bottom right)
   - Click "Assets" tab (should already be selected)

3. **Upload Logo**:
   - Click "Choose File" button
   - Select a logo image (PNG, JPG, or SVG)
   - Click "Upload" button
   - You should see your logo appear in the asset grid

4. **Set as Default Logo**:
   - Find your uploaded logo in the grid
   - Click "Use as Default Logo" button
   - Button should change to "Default Logo ✓"
   - Console should show:
     ```
     [Admin] Setting default logo to asset: <id>
     [Admin] Triggering logo resolution after setting default
     [Asset Resolution] Admin logo detected: asset:<id>
     [Asset Resolution] assetToDataURL available, resolving...
     [Asset] Resolving asset ID: <id>
     [Asset] Found asset, converting to data URL: <filename> <type> <size> bytes
     [Asset] Conversion complete, data URL length: <length>
     [Asset Resolution] Logo resolved successfully, length: <length>
     [Asset Resolution] Added show-logo class to body
     [Asset Resolution] Re-rendered app with resolved logo
     ```

5. **Close Admin Panel**: Click "Close" button

6. **Generate Preview**:
   - Fill in at least Client Name and Project Name
   - Click "Generate Proposal Preview"
   - **Expected**: Logo should appear in:
     - Header (top left, white logo on dark background)
     - Proposal body (top of page, before project name)

7. **Export HTML**:
   - In preview, click "Export HTML" button
   - Download should start: `Client_Proposal.html`
   - Open the downloaded HTML file
   - **Expected**: Logo should be visible in the document

8. **Export PDF**:
   - In preview, click "Print / Export PDF" button
   - Print dialog should open
   - Select "Save as PDF" or "Microsoft Print to PDF"
   - **Expected**: Logo should appear in the PDF preview and saved PDF

## Expected Console Output

When logo is properly configured, you should see:

```
[Admin] Setting logo to asset: <id>
[Admin] Triggering logo resolution
[Asset Resolution] Admin logo detected: asset:<id>
[Asset Resolution] assetToDataURL available, resolving...
[Asset] Resolving asset ID: <id>
[Asset] Found asset, converting to data URL: logo.png image/png 12345 bytes
[Asset] Conversion complete, data URL length: 16800
[Asset Resolution] Logo resolved successfully, length: 16800
[Asset Resolution] Added show-logo class to body
[Asset Resolution] Re-rendered app with resolved logo
```

## IndexedDB Inspection

To check stored assets:

```javascript
// Run this in console to dump IndexedDB assets
(async function() {
  const r = indexedDB.open('foundry-assets');
  r.onsuccess = () => {
    const db = r.result;
    const tx = db.transaction('assets', 'readonly');
    tx.objectStore('assets').getAll().onsuccess = e => {
      console.log('Stored assets:', e.target.result);
      e.target.result.forEach((asset, i) => {
        console.log(`Asset ${i + 1}:`, {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          size: asset.size,
          blobSize: asset.blob?.size
        });
      });
    };
  };
  r.onerror = () => console.error('Failed to open IndexedDB');
})();
```

## Troubleshooting

### Logo Not Appearing in Preview

1. Check console for errors
2. Verify `window.printConfig.showLogoInPrint` is `true`
3. Verify `document.body.classList.contains('show-logo')` is `true`
4. Check `window.images.logo` starts with `data:` (not `asset:`)

### Logo Not in PDF Export

1. Check browser print preview settings
2. Ensure "Background graphics" is enabled in print settings
3. Verify the logo is visible in the browser preview before printing

### Asset Resolution Fails

1. Check if `window.assetToDataURL` is a function
2. Verify admin-addon.js is loaded (check Network tab)
3. Check IndexedDB has the asset stored
4. Try re-uploading the logo

## Developer Utilities

Available in console:

```javascript
// Toggle logo visibility
window.toggleShowLogo(true);   // Show logo
window.toggleShowLogo(false);  // Hide logo

// Toggle print logo
window.togglePrintLogo(true);  // Enable in PDF
window.togglePrintLogo(false); // Disable in PDF

// Manually trigger logo resolution
await window.ensureAdminLogoResolved();

// Re-render app
window.renderApp();
```

## Success Criteria

✅ Logo uploads successfully to admin assets  
✅ "Use as Default Logo" sets the logo  
✅ Logo appears in preview (header and body)  
✅ Logo appears in exported HTML  
✅ Logo appears in exported PDF  
✅ Console shows no errors  
✅ Export buttons are visible and functional  
✅ Preview has normal background (no dimming)  

## Known Limitations

- Logo must be set via Admin panel to appear in preview/exports
- Default behavior is unbranded (no logo) for client deliverables
- Use `window.toggleShowLogo(true)` to force logo display for testing
