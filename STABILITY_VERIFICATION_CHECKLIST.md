# Site Stability Verification Checklist

**Purpose**: Systematically test all functionality to identify issues  
**Status**: Ready for use during freeze  
**Last Updated**: October 1, 2025

---

## How to Use This Checklist

1. Test each item in order
2. Mark with ✅ if it works correctly
3. Mark with ❌ if it fails
4. Document exact steps to reproduce any failures
5. Take screenshots/recordings of failures
6. Note browser/device used for each test

---

## Test Environment Setup

### Before You Begin
- [ ] Open browser DevTools (F12)
- [ ] Open Console tab to monitor for errors
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Note your browser version: _______________
- [ ] Note your OS: _______________
- [ ] Test URL: _______________

### Test on Multiple Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 1. Basic Site Loading

### 1.1 Initial Load
- [ ] Site loads without white screen
- [ ] No JavaScript errors in console
- [ ] No network request failures
- [ ] Foundry Cabinet branding visible
- [ ] Form fields render correctly

**If any fail, document**:
```
Browser: _______________
Error messages: _______________
Screenshot: _______________
```

### 1.2 Performance
- [ ] Page loads in under 3 seconds
- [ ] No infinite loading spinners
- [ ] Images load properly
- [ ] CSS styles applied correctly

---

## 2. Form Functionality

### 2.1 Basic Input
- [ ] Can type in "Company Name" field
- [ ] Can type in "Project Name" field
- [ ] Can type in "Project Number" field
- [ ] Can type in "Client Name" field
- [ ] Can select project type
- [ ] Can enter price
- [ ] Autosave works (check console for "Saving..." message)

### 2.2 Advanced Input
- [ ] Can add items to scope of work
- [ ] Can add multiple line items
- [ ] Can add notes/descriptions
- [ ] Rich text formatting works (if applicable)
- [ ] Date picker works correctly
- [ ] Currency formatting displays correctly

### 2.3 Data Persistence
- [ ] Refresh page - data persists
- [ ] Close browser - reopen - data persists
- [ ] Check localStorage (DevTools → Application → Local Storage)

**localStorage check**:
```javascript
// Run in console
console.log(localStorage.getItem('foundry-last-proposal'));
```

---

## 3. Image Upload & Management

### 3.1 Image Upload
- [ ] Can click "Upload Image" button
- [ ] File picker opens
- [ ] Can select image file (.jpg, .png)
- [ ] Image uploads without error
- [ ] Image displays in preview
- [ ] Image thumbnail visible

**Test with**:
- Small image (< 100KB)
- Medium image (100KB - 1MB)
- Large image (1MB - 5MB)
- Very large image (> 5MB) - should warn or reject

### 3.2 Multiple Images
- [ ] Can upload multiple images
- [ ] Each image displays correctly
- [ ] Can remove individual images
- [ ] Can reorder images (if feature exists)

### 3.3 Image Display
- [ ] Images display in form preview
- [ ] Images display in HTML preview
- [ ] Images display in PDF export
- [ ] Image quality acceptable
- [ ] Images not distorted or stretched

---

## 4. Admin Panel

### 4.1 Access Admin Panel
- [ ] Can see "ADMIN" button (bottom-right corner)
- [ ] If not visible, can use `window.switchToAdmin()` in console
- [ ] Can click ADMIN button to open panel
- [ ] Admin panel modal opens
- [ ] Admin panel content loads

**If ADMIN button not visible**:
```javascript
// Run in console to force admin mode
window.switchToAdmin();
// Then refresh page
```

### 4.2 Logo Upload
- [ ] Can open "Assets" tab in admin panel
- [ ] Can upload logo file
- [ ] Logo appears in asset list
- [ ] Can set logo as "Dark variant" (for HTML preview)
- [ ] Can set logo as "Light variant" (for PDF export)
- [ ] Logo file stored in IndexedDB

**Check IndexedDB**:
- DevTools → Application → IndexedDB → foundry-assets

### 4.3 Logo Display - Dark Variant (HTML)
- [ ] Close admin panel
- [ ] Click "Generate Proposal Preview"
- [ ] Preview shows dark background
- [ ] Logo displays in header (white/light version)
- [ ] Logo is visible against dark background
- [ ] Logo sizing appropriate

### 4.4 Logo Display - Light Variant (PDF)
- [ ] Click "Export as PDF"
- [ ] PDF shows white/light background
- [ ] Logo displays in PDF (dark/black version)
- [ ] Logo is visible against light background
- [ ] Logo sizing appropriate in PDF

### 4.5 Logo Edge Cases
- [ ] Upload logo without setting variant - what happens?
- [ ] Set dark variant only - does it appear in both preview and PDF?
- [ ] Set light variant only - does it appear in both preview and PDF?
- [ ] Delete logo - does it remove from preview/PDF?
- [ ] Upload new logo - does it replace old one?

---

## 5. Preview Generation

### 5.1 HTML Preview
- [ ] Click "Generate Proposal Preview" button
- [ ] Preview loads without error
- [ ] All form data appears in preview
- [ ] Images display in preview
- [ ] Logo displays in header (if configured)
- [ ] Formatting looks professional
- [ ] Colors match brand guidelines

### 5.2 Preview Content
- [ ] Company name displays correctly
- [ ] Project name displays correctly
- [ ] Project number displays correctly
- [ ] Client name displays correctly
- [ ] Price displays with correct currency
- [ ] All scope items listed
- [ ] All notes/descriptions visible
- [ ] Date formats correctly

### 5.3 Preview Styling
- [ ] Dark background (#0B1120)
- [ ] White text on dark background
- [ ] Header scrolls with page OR stays fixed (check docs for expected behavior)
- [ ] Footer displays correctly
- [ ] Page breaks appropriate
- [ ] No text cutoff
- [ ] No overlapping elements

### 5.4 Preview Interaction
- [ ] Can scroll through preview
- [ ] Can click "Back to Edit" to return to form
- [ ] Can click "Export" buttons
- [ ] Preview updates when form data changes
- [ ] No JavaScript errors during preview

---

## 6. PDF Export

### 6.1 Export Button
- [ ] "Export as PDF" button visible in preview
- [ ] Can click export button
- [ ] Export process begins
- [ ] No JavaScript errors during export
- [ ] Download dialog appears
- [ ] PDF file downloads

### 6.2 PDF Content
- [ ] Open downloaded PDF file
- [ ] PDF displays all content from preview
- [ ] PDF shows light background (white)
- [ ] PDF shows dark text (black)
- [ ] Logo displays correctly (light variant)
- [ ] All images included in PDF
- [ ] Image quality acceptable

### 6.3 PDF Formatting
- [ ] Header displays correctly
- [ ] Footer displays correctly
- [ ] Page breaks logical
- [ ] No text cutoff at page edges
- [ ] No overlapping elements
- [ ] Professional appearance
- [ ] Printable

### 6.4 PDF Edge Cases
- [ ] Export with no images - works?
- [ ] Export with many images (10+) - works?
- [ ] Export with large images - works?
- [ ] Export with no logo - works?
- [ ] Export with very long content - pagination correct?

**Common PDF Issues to Check**:
- Header/footer positioning
- Logo size and placement
- Image encoding/quality
- Page break logic
- Font rendering
- Color accuracy

---

## 7. HTML Export

### 7.1 Export Button
- [ ] "Export as HTML" button visible in preview
- [ ] Can click export button
- [ ] Export process begins
- [ ] No JavaScript errors during export
- [ ] Download dialog appears
- [ ] HTML file downloads

### 7.2 HTML File
- [ ] Open downloaded HTML file
- [ ] File opens in browser
- [ ] All content displays
- [ ] Images embedded (base64)
- [ ] Logo embedded
- [ ] Styling intact
- [ ] No external dependencies
- [ ] File is self-contained

### 7.3 HTML File Portability
- [ ] Can email HTML file to someone
- [ ] They can open it without issues
- [ ] All images display for them
- [ ] No broken links
- [ ] File size reasonable

---

## 8. QR Code Generation

### 8.1 QR Code Display
- [ ] QR code visible in preview (if 3D model URL provided)
- [ ] QR code scannable (test with phone)
- [ ] QR code links to correct URL
- [ ] QR code included in PDF export
- [ ] QR code included in HTML export

### 8.2 QR Code Without URL
- [ ] If no 3D model URL provided, QR code not shown
- [ ] No broken QR code placeholder
- [ ] No JavaScript errors

---

## 9. Role System

### 9.1 Role Indicator
- [ ] Role badge visible in top-right corner
- [ ] Badge shows current role (Admin/Agent/Client)
- [ ] Badge color correct:
  - Green = Administrator
  - Yellow = Agent
  - Blue = Client

### 9.2 Role Switching
- [ ] Can switch roles via console: `window.switchToAdmin()`
- [ ] Can switch roles via URL: `?role=admin`
- [ ] Role persists after page refresh
- [ ] Role affects what's visible:
  - Admin: All features + ADMIN button
  - Agent: Most features, no ADMIN button
  - Client: Limited features

### 9.3 Role Permissions
- [ ] Admin can access admin panel
- [ ] Agent cannot access admin panel
- [ ] Client has most restricted view
- [ ] No permission errors in console

---

## 10. Autosave Functionality

### 10.1 Autosave Trigger
- [ ] Type in a form field
- [ ] Wait 20 seconds
- [ ] Check console for "Saving..." message
- [ ] Data persists if page refreshed

### 10.2 Autosave Behavior
- [ ] Doesn't save on every keystroke (performance)
- [ ] Saves after inactivity period
- [ ] Doesn't interrupt typing
- [ ] No performance degradation
- [ ] No memory leaks over time

---

## 11. Error Handling

### 11.1 Expected Errors
- [ ] Try to upload 100MB image - graceful error
- [ ] Try to fill localStorage completely - graceful error
- [ ] Try to export with no data - appropriate message
- [ ] Try invalid input in fields - validation works

### 11.2 Console Monitoring
- [ ] No uncaught exceptions
- [ ] No 404 errors for resources
- [ ] No CORS errors
- [ ] No deprecation warnings
- [ ] Only expected warnings (if any)

### 11.3 Network Errors
- [ ] Disconnect internet
- [ ] Try to load page from cache
- [ ] App still usable (localStorage data)
- [ ] Reconnect internet
- [ ] App resumes normal operation

---

## 12. Browser Compatibility

### Test on Chrome
- [ ] All above tests pass
- [ ] Note Chrome version: _______________

### Test on Firefox
- [ ] All above tests pass
- [ ] Note Firefox version: _______________

### Test on Safari
- [ ] All above tests pass
- [ ] Note Safari version: _______________

### Test on Edge
- [ ] All above tests pass
- [ ] Note Edge version: _______________

---

## 13. Mobile Testing

### Test on Mobile Browser
- [ ] Site loads on mobile
- [ ] Form usable on mobile
- [ ] Touch interactions work
- [ ] File upload works on mobile
- [ ] Preview displays correctly
- [ ] Export works on mobile
- [ ] No horizontal scrolling issues

**Test Devices**:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)

---

## 14. Performance Testing

### 14.1 Load Time
- [ ] Initial load under 3 seconds
- [ ] Form interaction responsive
- [ ] Preview generation under 5 seconds
- [ ] PDF export under 10 seconds (without images)
- [ ] PDF export under 30 seconds (with 5 images)

### 14.2 Memory Usage
- [ ] Open DevTools → Performance → Memory
- [ ] Use app for 10 minutes
- [ ] Check for memory leaks
- [ ] Memory usage stable

### 14.3 Large Data Sets
- [ ] Add 50 scope items
- [ ] Add 20 images
- [ ] Generate preview
- [ ] Export PDF
- [ ] Check performance acceptable

---

## 15. Security Testing

### 15.1 XSS Prevention
- [ ] Try entering `<script>alert('XSS')</script>` in form fields
- [ ] Verify it displays as text, not executed
- [ ] Try entering `<img src=x onerror=alert('XSS')>` in form fields
- [ ] Verify it displays as text, not executed

### 15.2 Input Validation
- [ ] Try entering SQL injection strings
- [ ] Try entering extremely long strings
- [ ] Try entering special characters
- [ ] All handled gracefully

### 15.3 localStorage Security
- [ ] Check localStorage doesn't contain sensitive data
- [ ] Check no credentials stored
- [ ] Check no PII stored inappropriately

---

## 16. Edge Cases

### 16.1 Empty State
- [ ] Load app with no data
- [ ] All features accessible
- [ ] Helpful placeholder text
- [ ] Can start creating proposal

### 16.2 Maximum Data
- [ ] Fill every field
- [ ] Add maximum images
- [ ] Add maximum scope items
- [ ] Export still works
- [ ] No errors

### 16.3 Special Characters
- [ ] Use emojis in fields 😀🎉
- [ ] Use special chars: <>&"'`
- [ ] Use international chars: àéîôü
- [ ] All display and export correctly

### 16.4 Browser Storage Limits
- [ ] Add data until localStorage full
- [ ] App handles gracefully
- [ ] User notified appropriately
- [ ] No data loss

---

## Issue Reporting Template

When you find an issue, document it like this:

```markdown
### Issue #[number]: [Short Description]

**Severity**: [Critical/High/Medium/Low]
**Component**: [Form/Preview/Export/Admin/etc.]
**Browser**: [Chrome 118 / Firefox 119 / etc.]
**OS**: [Windows 11 / macOS 14 / etc.]

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Error Messages** (if any):
```
[Paste console errors]
```

**Screenshot**:
[Attach screenshot]

**Workaround** (if known):
[How to work around this issue]

**Related Issues**:
[Link to similar issues if any]
```

---

## Summary Template

After completing all tests, summarize:

```markdown
# Test Summary

**Date**: [date]
**Tester**: [name]
**Duration**: [how long testing took]

## Results

**Total Tests**: [number]
**Passed**: [number] ✅
**Failed**: [number] ❌
**Blocked**: [number] ⚠️

## Critical Issues Found

1. [Issue 1]
2. [Issue 2]
3. [Issue 3]

## Medium Issues Found

1. [Issue 1]
2. [Issue 2]

## Low Issues Found

1. [Issue 1]
2. [Issue 2]

## Overall Assessment

[STABLE / UNSTABLE / BROKEN]

[Your detailed assessment of site stability]

## Recommendation

[Recommend to lift freeze / Keep freeze / Rollback / etc.]
```

---

## Next Steps After Testing

1. **If all tests pass**: Document that site is stable, recommend lifting freeze
2. **If critical issues found**: Document issues, create fix plan, test fixes
3. **If site broken**: Consider rollback (see ROLLBACK_PROCEDURE.md)
4. **If unsure**: Get second opinion, test again

---

**Remember**: Be thorough, document everything, don't rush. The goal is to restore confidence in the site's stability.

---

End of Checklist
