# Troubleshooting Guide

## 🚨 "I Updated the Code But Nothing Changed!"

### → **[CHANGES_NOT_SHOWING.md](./CHANGES_NOT_SHOWING.md)** ← START HERE FIRST

**That guide covers 95% of cases in simple steps.** This document is for advanced troubleshooting only.

If you've already read [CHANGES_NOT_SHOWING.md](./CHANGES_NOT_SHOWING.md) and still need help, continue below.

---

## Advanced Troubleshooting

This is the **#1 most common issue**. Here's why it happens and how to fix it.

### The Problem

You updated the code on GitHub, but when you visit your live site, you still see the old version. This is frustrating!

### Why This Happens

There are **THREE SEPARATE THINGS** that need to sync up:

1. **Your Code on GitHub** (e.g., the `main` branch)
2. **The Deployed Site** (GitHub Pages, Netlify, etc.)
3. **Your Browser's Cache**

If ANY of these are out of sync, you'll see old content.

---

## Solution: Follow These Steps IN ORDER

### Step 1: Verify Your Code is on GitHub

```bash
git status
git log --oneline -5
```

Make sure:
- ✅ Your changes are committed: `git commit -m "Your changes"`
- ✅ Your changes are pushed: `git push origin main`
- ✅ You're on the right branch: `git branch` (should show `* main`)

### Step 2: Check Which Branch is Deployed

**For GitHub Pages:**
1. Go to: https://github.com/scott-a11y/proposal-builder/settings/pages
2. Look at "Source"
3. Note which branch it deploys (usually `main` or `gh-pages`)

**For Netlify:**
1. Go to: https://app.netlify.com/
2. Find your site
3. Go to Site Settings → Build & Deploy
4. Check "Production branch"

**For Vercel:**
1. Go to: https://vercel.com/dashboard
2. Find your project
3. Go to Settings → Git
4. Check "Production Branch"

### Step 3: Make Sure Your Changes Are on the Deployed Branch

If your hosting deploys from `gh-pages` but you pushed to `main`, your changes won't appear!

**To check:**
```bash
git checkout gh-pages  # Or whatever your deploy branch is
git log --oneline -5   # Should show your recent changes
```

**If your changes aren't there:**
```bash
git checkout gh-pages
git merge main         # Merge your changes from main
git push origin gh-pages
```

### Step 4: Run the Version Checker

```bash
./check-deployed-version.sh
```

This will tell you:
- ✅ **UP TO DATE**: Your deployed site matches your code
- ❌ **OUTDATED**: Your deployed site is behind your code
- ⚠️ **Cannot reach**: Site isn't deployed at that URL

### Step 5: Wait for Deployment (IF OUTDATED)

If the version checker shows OUTDATED:

1. **Wait 5-10 minutes** for deployment
2. **Check GitHub Actions**: https://github.com/scott-a11y/proposal-builder/actions
3. **Run version checker again**: `./check-deployed-version.sh`

### Step 6: Clear Your Browser Cache

Even after deployment completes, your browser might show old content.

**Quick fix:**
- **Hard refresh**: Ctrl + F5 (Windows) or Cmd + Shift + R (Mac)
- **Incognito mode**: Open a private/incognito window
- **Different browser**: Try a browser you haven't used recently

**Nuclear option (if hard refresh doesn't work):**
- Chrome/Edge: Ctrl + Shift + Delete → Check "Cached images and files" → Clear
- Firefox: Ctrl + Shift + Delete → Check "Cache" → Clear Now
- Safari: Cmd + Option + E

---

## Common Scenarios

### Scenario A: "I pushed to `main` but GitHub Pages deploys from `gh-pages`"

**Solution:**
```bash
git checkout gh-pages
git merge main
git push origin gh-pages
```

### Scenario B: "GitHub Actions updated the version but I still see old code"

**Problem:** GitHub Actions updates the version on `main`, but your hosting might deploy from a different branch.

**Solution:** Check which branch your hosting deploys from (Step 2 above).

### Scenario C: "I see different versions on different computers"

**Problem:** Each device has its own browser cache.

**Solution:** Clear cache on ALL devices, or use incognito mode.

### Scenario D: "It works in incognito but not in normal browsing"

**Problem:** Your normal browser has cached the old version.

**Solution:** Clear your browser cache (Step 6 above).

### Scenario E: "The version checker says UP TO DATE but I still see old content"

**Problem:** Your browser has an aggressive cache or a service worker.

**Solution:**
1. Open DevTools (F12)
2. Go to Application tab → Service Workers
3. Click "Unregister" for any service workers
4. Go to Application tab → Storage
5. Click "Clear site data"
6. Hard refresh (Ctrl + F5)

---

## Advanced Debugging

### Check What Your Browser Actually Received

1. Open DevTools (F12)
2. Go to **Network** tab
3. Hard refresh (Ctrl + F5)
4. Find `index.html` in the list
5. Click it → **Response** tab
6. Search for `<!-- Version:` in the response
7. **The version should match your code!**

If the version in the Network tab is OLD:
- Your CDN/hosting provider hasn't updated yet (wait 10 minutes)
- You're hitting a cached CDN node (clear CDN cache)

If the version in the Network tab is NEW but you see OLD content:
- Your browser is using cached JS/CSS files
- Clear browser cache completely (Step 6 above)

### Check GitHub Actions

1. Go to: https://github.com/scott-a11y/proposal-builder/actions
2. Look for recent workflow runs
3. Click on the most recent one
4. Check if it succeeded or failed

If it failed:
- Click on the failed job to see error logs
- Fix the error in your code
- Push again

### Check Deployment Logs

**Netlify:**
1. Dashboard → Deploys
2. Click on most recent deploy
3. Check "Deploy log" for errors

**Vercel:**
1. Dashboard → Deployments
2. Click on most recent deployment
3. Check "Building" log for errors

**GitHub Pages:**
- Usually no detailed logs available
- Check Actions tab for build failures

---

## Prevention: How to Avoid This Issue

### 1. Always Use the Update Script

After making changes to JS or CSS files:
```bash
./update-version.sh
git add .
git commit -m "Your changes"
git push origin main
```

### 2. Wait for Deployment Before Testing

After pushing:
1. Wait 5 minutes
2. Run `./check-deployed-version.sh`
3. If OUTDATED, wait another 5 minutes
4. Only then test in browser

### 3. Test in Incognito Mode First

This bypasses your browser cache and shows you what new visitors see.

### 4. Set Up a Staging Environment

Deploy to a staging URL first:
- Netlify: Deploy previews for pull requests
- Vercel: Preview deployments
- GitHub: Create a `staging` branch and deploy from that

---

## Still Stuck?

If you've tried everything above and still have issues:

1. **Run the version checker**: `./check-deployed-version.sh`
2. **Check GitHub Actions**: https://github.com/scott-a11y/proposal-builder/actions
3. **Open an issue** with:
   - URL you're viewing
   - Output of `./check-deployed-version.sh`
   - Screenshot of DevTools Network tab showing the version
   - Which branch your hosting deploys from

---

## Quick Reference

| Problem | Solution |
|---------|----------|
| Don't see changes | Run `./check-deployed-version.sh` |
| Outdated deployment | Wait 10 minutes, check again |
| Browser shows old | Hard refresh (Ctrl + F5) |
| Different branch | Merge changes to deploy branch |
| GitHub Actions failed | Check actions tab, fix errors |
| CDN cache | Wait 10 minutes or clear CDN |

---

**Remember:** Just because your code is on GitHub doesn't mean your live site is updated. Always verify with the version checker!
