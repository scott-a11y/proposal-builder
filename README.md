# Foundry Cabinet Co - Proposal Builder

A single-file HTML application for creating professional cabinet proposals with modern features and performance optimizations.

## ✨ Recent Improvements (v2.0)

### 🚀 Performance & Reliability
- **Debounced Autosave**: Smart 20-second intervals that only save when content changes
- **Image Caching**: Session-based cache prevents re-encoding images on repeated exports  
- **Memory Leak Prevention**: Proper cleanup of image load handlers
- **Optimized CDN Ready**: Production React 18 UMD, Tailwind CSS, and Supabase integration

### 🔒 Security Enhancements
- **Content Security Policy**: Strict CSP headers for XSS protection
- **Safe External Links**: All external links use `rel="noopener noreferrer"`
- **Filename Sanitization**: Export filenames are OS-safe and portable
- **localStorage Overflow Protection**: Graceful handling of storage limits

### 🎨 UX & Accessibility
- **Sticky Navigation**: Header remains visible while scrolling  
- **Page Markers**: Clear "PROJECT # | PAGE 01" indicators
- **Auto-focus**: First form field focused on load
- **Lazy Loading**: Non-critical images load on demand
- **Meaningful Alt Text**: Screen reader friendly image descriptions
- **QR Code Integration**: Mobile-friendly 3D model access

### 🎯 Brand Consistency
- **Color Palette**: Midnight (#0B1120), Slate (#1E293B), Cloud (#F1F5F9), Amber (#F59E0B)
- **Typography**: System UI stack with proper hierarchy
- **Logo Integration**: Responsive logo handling with fallbacks

## 🛠 Technical Stack

- **Frontend**: Vanilla JavaScript (React UMD ready)
- **Styling**: Custom CSS with Tailwind integration
- **Storage**: localStorage + Supabase ready
- **Export**: HTML/PDF generation with embedded images
- **Security**: CSP, safe filename handling, XSS prevention

## 🚀 Getting Started

### First Time Setup
1. Open `index.html` in a web browser or serve via HTTP server
2. **Access Admin Panel**: Look for the "ADMIN" button in the bottom-right corner
   - If you don't see it, you may be in Client role. See [Admin Access Guide](./ADMIN_ACCESS_GUIDE.md)
   - Quick fix: Run `window.switchToAdmin()` in browser console or add `?role=admin` to URL
3. Upload company logo and configure branding (optional)
4. Fill out project information and upload images
5. Generate preview and export as HTML or PDF

### Role Indicator
Check the **top-right corner** for a colored badge showing your current role:
- 🟢 **Green (Administrator)** = Full access, Admin button visible
- 🔵 **Blue (Agent)** = Can edit and export, no Admin access  
- 🟠 **Orange (Client)** = View-only mode, no Admin access

**Tip**: Click the role badge when not in Admin mode for help switching back!

## 🔧 Configuration

### Development Setup
1. Open `index.html` in a web browser or serve via HTTP server
2. For testing, run: `python3 -m http.server 8080` or use any local server
3. Open the test suite at `/tests.html` to verify functionality

### Production Deployment
1. **Server Configuration**:
   - Serve files via HTTPS for security
   - Configure proper MIME types for `.js`, `.css`, and `.html` files
   - Set up gzip compression for better performance

2. **Security Headers** (recommended):
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; 
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Referrer-Policy: strict-origin-when-cross-origin
   ```

3. **Optional External Dependencies**:
   - Uncomment CDN links in `<head>` section if using React components
   - Add real Supabase credentials to `SUPABASE_URL` and `SUPABASE_ANON_KEY` if using cloud storage
   - Set up RLS policies in Supabase for write protection

4. **Admin Configuration**:
   - Upload company logo via Admin panel
   - Configure templates and branding settings
   - Set up email recipients for proposals

5. **Performance Optimization**:
   - Enable browser caching for static assets
   - Consider using a CDN for better global performance
   - Monitor localStorage usage for large image uploads

## 📋 Features

- ✅ Multi-page proposal generation
- ✅ Image upload and management  
- ✅ QR code generation for 3D models
- ✅ HTML/PDF export with safe filenames
- ✅ Real-time preview with sticky navigation
- ✅ Auto-save with smart dirty detection
- ✅ Brand-consistent styling and layout
- ✅ Accessibility and performance optimized
- ✅ Security hardened with CSP and safe practices

Built with ❤️ for Foundry Cabinet Co

## 🔍 Testing

Run the test suite by opening `/tests.html` in your browser. The tests cover:
- Utility function validation
- XSS prevention mechanisms  
- Data structure validation
- Error handling functionality

## 🚨 Troubleshooting

### Common Issues:

**Logo not displaying:**
- The app now uses a fallback SVG logo by default
- Upload a custom logo via Admin panel for branding
- Check browser console for any remaining 404 errors

**QR codes not working:**
- QR codes are generated client-side (no external dependencies)
- Ensure 3D model links are valid URLs
- QR codes are placeholder patterns for demonstration

**Export functionality:**
- HTML export should work immediately
- PDF export uses browser's print functionality
- Check browser's download settings if files aren't saving

**Performance issues:**
- Large images may slow down the app
- Consider resizing images before upload
- Clear localStorage if the app becomes unresponsive

**Admin panel not accessible:**
- **See the [Admin Access Guide](./ADMIN_ACCESS_GUIDE.md) for comprehensive troubleshooting**
- Quick fix: Run `window.switchToAdmin()` in browser console
- Or add `?role=admin` to the URL
- The admin button is hidden when in Client or Agent role
- Check the role indicator in the top-right corner to see your current role
