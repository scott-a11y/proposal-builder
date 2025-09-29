# PDF/Print Formatting Guide

This guide explains the enhanced PDF/print functionality in the proposal-builder app.

## 🖨️ PDF Export Features

### Default Behavior
- **Unbranded PDFs**: Client PDFs have no logo by default for clean, professional appearance
- **Professional formatting**: Proper margins (0.75in), page breaks, and typography
- **Clean output**: All UI elements (Share, Admin, form controls) automatically hidden
- **Multiple page sizes**: Supports both Letter (8.5x11) and A4 formats
- **Fallback logo system**: Uses inline SVG when image files are missing

### Logo Control

#### Logo Sources (documented in code)
1. **DEFAULT_LOGO_PATH**: `./Foundry-Cabinetco-Logo-2-White-Text.png` (main company logo)
2. **INLINE_FALLBACK_LOGO**: SVG fallback with company text (used when PNG fails)
3. **Admin-uploaded assets**: Via admin-addon.js asset management system

#### Enabling Logo in PDFs
By default, client PDFs are unbranded. To enable logo:

**Method 1: Developer console**
```javascript
// Enable logo for next print
window.printConfig.showLogoInPrint = true;

// Disable logo 
window.printConfig.showLogoInPrint = false;

// Check current status
console.log('Logo enabled:', window.printConfig.showLogoInPrint);
```

**Method 2: Configuration (for admin integration)**
```javascript
window.printConfig.showLogoInPrint = true;
```

**Method 3: Admin settings (if admin-addon.js loaded)**
Admin can configure via `adminConfig.branding.showLogoInPrint = true`

### Page Break Control

#### Automatic Page Breaks
The system automatically prevents awkward breaks:
- Headings won't break from their content
- Card sections stay together  
- Images and captions stay together
- Grid layouts maintain integrity

#### Manual Page Breaks
Add the `.page-break` class to force a page break before an element:

```html
<div class="page-break">
  <h2>This will start on a new page</h2>
</div>
```

### Print Styling Classes

#### Utility Classes
- `.page-break` - Force page break before element
- `.page-break-avoid` - Prevent page break inside element  
- `.print-hidden` - Hide element in print/PDF only
- `.print-mode` - Applied to body during print (for custom styles)
- `.show-logo` - Added when logo should be visible in print

#### Print Mode Detection
During print/export, the system adds classes to `<body>`:
- `.print-mode` - Always present during print
- `.show-logo` - Only when logo is enabled

## 🎨 Customization

### Supported Page Formats
- **Letter**: 8.5" x 11" (default for US)
- **A4**: 210mm x 297mm (automatic detection)

### Margin Control
Default margins are 0.75 inches. Modify via CSS:
```css
@media print {
  .proposal-page {
    padding: 0.5in !important; /* Smaller margins */
  }
}
```

### Logo Appearance
When enabled, logos are:
- Max height: 1.5 inches
- Filtered for better print contrast
- Positioned at top of document
- Set to avoid page breaks

## 🔧 Technical Details

### Implementation
- **Print stylesheet**: `print.css` handles all print-specific formatting
- **Print-mode system**: JavaScript adds classes for targeted styling
- **Logo control**: Configuration system with safe defaults
- **Form hiding**: Interactive elements automatically hidden in print

### Browser Support
- Chrome/Chromium: Full support
- Firefox: Full support  
- Safari: Full support
- Edge: Full support

### Troubleshooting

**Logo not showing when enabled:**
- Check `shouldShowLogoInPrint()` returns true
- Verify logo source is accessible
- Ensure `.show-logo` class is applied

**Content cut off:**
- Check page margins in print.css
- Verify content fits within page boundaries
- Use browser's print preview to test

**Unwanted page breaks:**
- Add `.page-break-avoid` class to keep content together
- Check for conflicting CSS that forces breaks

## 📝 Developer Notes

### Adding New Print Styles
Add styles in `print.css` under the `@media print` block:
```css
@media print {
  .my-custom-element {
    page-break-inside: avoid !important;
    margin-bottom: 1rem !important;
  }
}
```

### Logo Integration
To add a new logo source:
1. Update the logo resolution logic in `shouldShowLogoInPrint()`
2. Document the source in the comments
3. Test with both enabled/disabled states

### Testing Print Output
```javascript
// Quick test with logo
togglePrintLogo(true);
// Then click "Print / Export PDF"

// Quick test without logo  
togglePrintLogo(false);
// Then click "Print / Export PDF"
```