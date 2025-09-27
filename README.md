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

For production deployment:
1. Uncomment CDN links in `<head>` section  
2. Add real Supabase credentials to `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Configure CSP headers at server level for enhanced security
4. Set up RLS policies in Supabase for write protection

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
