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

1. Open `index.html` in a web browser or serve via HTTP server
2. Fill out project information and upload images
3. Generate preview and export as HTML or PDF
4. QR codes are automatically generated for 3D model links

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
- Ensure all JavaScript files are loaded
- Check browser console for script errors
- Admin panel requires no authentication by default
