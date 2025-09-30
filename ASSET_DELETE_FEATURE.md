# Asset Delete Feature

## Overview

Added a Delete button to each asset card in the Admin Console's Assets tab, allowing users to remove unwanted logo assets from their library.

## What Was Fixed

**Problem**: Users could upload logo assets but had no way to delete them, leading to cluttered asset libraries and inability to manage logos.

**Solution**: Added a red Delete button to each asset card that:
- Shows a confirmation dialog before deletion
- Properly clears logo variant settings if the asset was in use
- Updates the configuration to disable logo printing if no variants remain
- Clears in-memory image cache
- Refreshes the asset list after deletion

## How to Use

1. Open the **Admin Console** (click the "Admin" button in the bottom-right)
2. Go to the **Assets** tab
3. Find the asset you want to delete
4. Click the red **Delete** button
5. Confirm the deletion in the dialog

## Technical Details

### Files Modified
- `admin-addon.js` - Added delete button to asset card rendering (lines 568-610)

### Key Features
- **Confirmation Dialog**: Prevents accidental deletion with "Delete [filename]? This cannot be undone."
- **Config Cleanup**: If the deleted asset was set as Dark or Light logo variant, the config is automatically cleared
- **Print Config Update**: `showLogoInPrint` is set to `false` if no logo variants remain
- **Memory Cleanup**: Clears `window.images.logoOnDark`, `window.images.logoOnLight`, and updates `window.images.logo`
- **UI Refresh**: Asset grid automatically refreshes after deletion

### Code Flow

```javascript
// 1. User clicks Delete button
// 2. Confirmation dialog shows
// 3. If confirmed:
//    a. Check if asset is set as a logo variant
//    b. If yes, clear the variant from config
//    c. Update showLogoInPrint if needed
//    d. Clear in-memory images
//    e. Delete asset from IndexedDB
//    f. Refresh asset list
//    g. Re-render Assets tab
```

## Testing

### Manual Test Cases

✅ **Upload and Delete**
1. Upload a test logo
2. Click Delete
3. Confirm deletion
4. Verify asset is removed from list

✅ **Delete Variant Logo**
1. Upload a logo
2. Set as Dark or Light variant
3. Click Delete
4. Confirm deletion
5. Verify config is cleared: `localStorage.getItem('foundry-admin-config')`
6. Check that `logoAssetIdDark`, `logoAssetIdLight`, and `showLogoInPrint` are cleared

✅ **Cancel Deletion**
1. Upload a logo
2. Click Delete
3. Click Cancel in the dialog
4. Verify asset remains in the list

### Browser Console Verification

```javascript
// Check current config
const cfg = JSON.parse(localStorage.getItem('foundry-admin-config') || '{}');
console.log('Dark Logo:', cfg.company?.logoAssetIdDark);
console.log('Light Logo:', cfg.company?.logoAssetIdLight);
console.log('Show in Print:', cfg.branding?.showLogoInPrint);

// List all assets
window.listAssets().then(assets => console.log('Assets:', assets));
```

## Visual Changes

### Before
- Assets had only "Set as Dark (HTML)" and "Set as Light (PDF)" buttons
- No way to remove unwanted assets

### After
- Each asset now has a red "Delete" button
- Clicking Delete shows a confirmation dialog
- After deletion, the asset is removed from the grid

## Button Styling

The Delete button uses:
- **Color**: Red (`#dc3545`) background with white text
- **Size**: 10px font, 6px vertical and 8px horizontal padding
- **Position**: Below the "Set as Dark" and "Set as Light" buttons

## Related Documentation
- See `LOGO_VARIANT_GUIDE.md` for logo variant system overview
- See `admin-addon.js` for full implementation

---

**Version**: 1.0  
**Date**: 2025-09-30  
**Issue**: Asset logo management - missing delete functionality
