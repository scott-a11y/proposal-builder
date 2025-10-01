# Deployment Verification Guide

## 🚨 Problem: "Changes Not Showing Up"

If you've updated the code multiple times but still see old content, you're likely checking the wrong deployment location or your CDN/hosting provider has aggressive caching.

---

## Step 1: Identify WHERE Your Site Is Deployed

Your site could be deployed to **multiple locations**. Check all of these:

### Possible Deployment Locations:

1. **GitHub Pages**
   - Default URL: `https://scott-a11y.github.io/proposal-builder/`
   - Custom domain: Check repository Settings → Pages

2. **Netlify**
   - Check: https://app.netlify.com/sites
   - Look for site connected to this repository
   - URL format: `https://[site-name].netlify.app/`

3. **Vercel**
   - Check: https://vercel.com/dashboard
   - Look for deployed projects

4. **Custom Server**
   - Apache/Nginx server
   - Your own domain (e.g., `proposals.foundrycabinet.com`)

---

## Step 2: Verify Which Branch Is Deployed

Different hosting services deploy from different branches:

### Check GitHub Pages Settings
1. Go to repository: https://github.com/scott-a11y/proposal-builder
2. Click **Settings** → **Pages**
3. Look for "Source" - it shows which branch is deployed
   - `main` branch
   - `gh-pages` branch
   - Custom branch

### Check Your Hosting Provider
- **Netlify**: Dashboard → Site Settings → Build & Deploy → Deploy contexts
- **Vercel**: Project Settings → Git Integration
- **GitHub Actions**: Check `.github/workflows/` for deployment workflows

---

## Step 3: Check Actual Deployed Version

Run this script to check what version is actually live on your site:

```bash
#!/bin/bash
# Save as check-deployed-version.sh

echo "🔍 Checking Deployed Version"
echo "=============================="
echo ""

# Get version from local code
LOCAL_VERSION=$(grep -oP '<!-- Version: \K[0-9]+' index.html)
echo "📁 Local version (in your code): $LOCAL_VERSION"
echo ""

# Check GitHub Pages
echo "🌐 Checking GitHub Pages..."
GH_VERSION=$(curl -s https://scott-a11y.github.io/proposal-builder/ | grep -oP '<!-- Version: \K[0-9]+' | head -1)
if [ -n "$GH_VERSION" ]; then
    echo "   GitHub Pages version: $GH_VERSION"
    if [ "$GH_VERSION" = "$LOCAL_VERSION" ]; then
        echo "   ✅ GitHub Pages is UP TO DATE"
    else
        echo "   ❌ GitHub Pages is OUTDATED (expected: $LOCAL_VERSION)"
    fi
else
    echo "   ⚠️  Cannot reach GitHub Pages (may not be deployed there)"
fi
echo ""

# Check Netlify (if you have a URL)
echo "🌐 To check Netlify, run:"
echo "   curl -s https://YOUR-SITE.netlify.app/ | grep -oP '<!-- Version: \K[0-9]+'"
echo ""

# Check custom domain (if you have one)
echo "🌐 To check custom domain, run:"
echo "   curl -s https://your-custom-domain.com/ | grep -oP '<!-- Version: \K[0-9]+'"
echo ""

echo "=============================="
echo "💡 If deployed version doesn't match local version:"
echo "   1. Check which branch is deployed"
echo "   2. Make sure changes are pushed to that branch"
echo "   3. Wait for deployment to complete (5-10 minutes)"
echo "   4. Clear your browser cache (Ctrl+F5)"
```

Save this script and run it:
```bash
chmod +x check-deployed-version.sh
./check-deployed-version.sh
```

---

## Step 4: Force a Fresh Deployment

### If Using GitHub Pages:
```bash
# Make sure you're on the main branch
git checkout main
git pull origin main

# Force push to trigger rebuild (if needed)
git commit --allow-empty -m "Force rebuild for deployment"
git push origin main
```

### If Using Netlify:
1. Go to Netlify Dashboard
2. Find your site
3. Click **Deploys** tab
4. Click **Trigger deploy** → **Deploy site**

### If Using Custom Server:
```bash
# SSH into your server
ssh user@your-server.com

# Pull latest changes
cd /path/to/proposal-builder
git pull origin main

# Restart web server if needed
sudo systemctl restart apache2  # or nginx
```

---

## Step 5: Clear ALL Caches

Even after deploying, you might see old content due to caching:

### 1. Browser Cache
- **Chrome/Edge**: Ctrl + Shift + Delete (Windows) or Cmd + Shift + Delete (Mac)
- **Hard Refresh**: Ctrl + F5 (Windows) or Cmd + Shift + R (Mac)

### 2. CDN Cache (if using Cloudflare, Netlify, etc.)
- **Cloudflare**: Dashboard → Caching → Purge Everything
- **Netlify**: Dashboard → Deploys → Trigger deploy → Clear cache and deploy site

### 3. DNS Cache
```bash
# Windows
ipconfig /flushdns

# Mac
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches
```

---

## Step 6: Verify Changes Are Actually Visible

Open your browser and check:

1. **Open DevTools** (F12)
2. Go to **Network** tab
3. **Reload page** (Ctrl + F5)
4. Find `index.html` in the list
5. Click on it → **Headers** tab
6. Look for `<!-- Version: YYYYMMDDHHMM -->` in the Response

**The version number should match your code!**

---

## Common Issues & Solutions

### Issue: "Changes are in `main` but not live"
**Solution**: Check if your hosting deploys from `main` or a different branch like `gh-pages`

### Issue: "GitHub Actions updated version but I don't see it"
**Solution**: 
1. Check if GitHub Actions actually ran: https://github.com/scott-a11y/proposal-builder/actions
2. Make sure the workflow completed successfully
3. Verify the commit was pushed to the correct branch

### Issue: "I see different versions on different devices"
**Solution**: You're hitting different cache layers. Clear cache on all devices and try incognito/private browsing mode.

### Issue: "Site shows old version for 5-10 minutes after deploy"
**Solution**: This is normal CDN propagation delay. Wait 10 minutes and hard refresh.

---

## Quick Checklist

Before saying "it's not working":

- [ ] I confirmed my changes are committed and pushed to GitHub
- [ ] I verified which branch my hosting deploys from
- [ ] I confirmed my changes are on that deployed branch
- [ ] I waited 5-10 minutes for deployment to complete
- [ ] I checked the actual deployed version number (Step 3)
- [ ] I did a hard refresh (Ctrl + F5 or Cmd + Shift + R)
- [ ] I tried in incognito/private browsing mode
- [ ] I verified in DevTools that the file has the new version number

---

## Still Not Working?

If you've done ALL of the above and still see old content:

1. **Check if multiple deployments exist**: You might be updating one deployment while viewing another
2. **Check git branch**: Run `git branch` to see which branch you're on
3. **Check git status**: Run `git status` to see if there are uncommitted changes
4. **Check GitHub Actions logs**: https://github.com/scott-a11y/proposal-builder/actions
5. **Ask for help**: Open an issue with:
   - URL you're viewing
   - Version number you expect
   - Version number you actually see
   - Screenshot of DevTools Network tab showing the version
