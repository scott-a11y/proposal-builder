# Deployment Configuration for Proposal Builder

## 🚨 NOT SEEING YOUR CHANGES?

### → **[CHANGES_NOT_SHOWING.md](./CHANGES_NOT_SHOWING.md)** ← READ THIS FIRST

**That guide has everything you need.** Come back here only if you need server configuration details.

---

## Quick Check

```bash
./check-deployed-version.sh
```

Then follow [CHANGES_NOT_SHOWING.md](./CHANGES_NOT_SHOWING.md) for next steps.

---

**🔍 STEP 3: Wait for deployment (5-10 minutes)**

After pushing to GitHub:
1. GitHub Actions runs (updates cache-busting version)
2. Your hosting provider detects the change
3. Your hosting provider builds and deploys
4. CDN caches clear

**This takes 5-10 minutes!** Don't panic if it's not instant.

**🔍 STEP 4: Clear your browser cache**

Even if the site is updated, your browser might show old content:
- **Hard refresh**: Ctrl + F5 (Windows) or Cmd + Shift + R (Mac)
- **Incognito mode**: Try viewing in a private/incognito window
- **Different browser**: Try Chrome, Firefox, or Safari

**📚 Still stuck? Read:** [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md)

---

## Server Requirements
- Static file server (Apache, Nginx, GitHub Pages, Netlify, etc.)
- HTTPS support (recommended)
- Gzip compression support (recommended)

## Apache Configuration (.htaccess)
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;"
</IfModule>
```

## Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    root /path/to/proposal-builder;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript text/javascript application/json text/plain;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;" always;

    # Cache static assets
    location ~* \.(css|js|png|svg)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## GitHub Pages Deployment
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Choose source branch (main/gh-pages)
4. Access via https://username.github.io/repository-name

## Netlify Deployment
1. Connect GitHub repository to Netlify
2. Build settings: No build command needed (static site)
3. Publish directory: `/` (root)
4. Add custom headers in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;"
```

## Environment Variables (if using Supabase)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Cache-Busting Version (Automated)

**✅ No manual action required!** The cache-busting version is now automatically updated via GitHub Actions on every push to `main`.

### How It Works
1. Push your code changes to `main`
2. GitHub Actions workflow automatically:
   - Detects JS/CSS file changes
   - Updates cache-busting version to current timestamp
   - Runs verification tests
   - Commits and pushes the update

### For More Details
See [CACHE_BUSTING_GUIDE.md](./CACHE_BUSTING_GUIDE.md) for complete documentation on the cache-busting system and automation.

### Manual Override (if needed)
```bash
# Only needed for troubleshooting or local testing
./update-version.sh
```

## Pre-deployment Checklist
- [ ] Push changes to `main` (cache-busting auto-updates)
- [ ] Wait for GitHub Actions to complete version update
- [ ] Test all functionality locally
- [ ] Run tests via `/tests.html`
- [ ] Verify logo fallback system works
- [ ] Test export functionality
- [ ] Check QR code generation
- [ ] Verify admin panel accessibility
- [ ] Test on different browsers
- [ ] Validate CSP headers
- [ ] Ensure HTTPS is configured
- [ ] Test performance with large images