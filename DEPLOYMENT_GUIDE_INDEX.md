# Deployment Guide Index

## 🚨 EMERGENCY: Changes Not Showing?

### → **[CHANGES_NOT_SHOWING.md](./CHANGES_NOT_SHOWING.md)** ← ONE GUIDE FOR EVERYTHING

**Stop here.** That guide covers 95% of issues. Read it first before looking at anything else.

---

## 📚 Complete Documentation Guide

**Note:** Most people only need [CHANGES_NOT_SHOWING.md](./CHANGES_NOT_SHOWING.md). The guides below are for advanced scenarios.

Choose the guide that matches your situation:

### 🔥 **I Need Help RIGHT NOW**
- **[CHANGES NOT SHOWING](./CHANGES_NOT_SHOWING.md)** - ⭐ **START HERE** - One guide for everything
- **[START HERE IF CHANGES NOT SHOWING](./START_HERE_IF_CHANGES_NOT_SHOWING.md)** - Quick link to main guide
- **[QUICK FIX CARD](./QUICK_FIX_CARD.md)** - Browser cache issues only

### 🔍 **I Need to Troubleshoot**
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Complete step-by-step debugging guide (advanced)
- **[DEPLOYMENT VERIFICATION](./DEPLOYMENT_VERIFICATION.md)** - How to verify deployment (advanced)

### 🌍 **I Don't Know Where My Site Is**
- **[CHANGES NOT SHOWING](./CHANGES_NOT_SHOWING.md)** - Has a section on this (read this first!)
- **[WHERE IS MY SITE](./WHERE_IS_MY_SITE.md)** - Understanding code vs live site (backup reference)

### 🚀 **I'm Setting Up Deployment**
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment configuration guide
- **[README.md](./README.md#-getting-started)** - Quick start and setup

### 🛠️ **I'm Developing**
- **[CACHE BUSTING GUIDE](./CACHE_BUSTING_GUIDE.md)** - How the versioning system works
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development workflow

---

## 🎯 Quick Commands

### Check if your deployed site matches your code:
```bash
./check-deployed-version.sh
```

### Update cache-busting version (after JS/CSS changes):
```bash
./update-version.sh
```

### Test cache-busting configuration:
```bash
./test-cache-busting.sh
```

### Start local development server:
```bash
python3 -m http.server 8080
# Then open http://localhost:8080/
```

---

## 📊 Common Scenarios

| Scenario | What To Do |
|----------|-----------|
| **Pushed code, changes not visible** | [START HERE](./START_HERE_IF_CHANGES_NOT_SHOWING.md) |
| **Don't know where site is deployed** | [WHERE IS MY SITE](./WHERE_IS_MY_SITE.md) |
| **GitHub Actions failed** | Check [Actions tab](https://github.com/scott-a11y/proposal-builder/actions) |
| **Site shows old version after waiting** | [TROUBLESHOOTING](./TROUBLESHOOTING.md#scenario-e-the-version-checker-says-up-to-date-but-i-still-see-old-content) |
| **Different versions on different devices** | Clear cache on all devices, see [TROUBLESHOOTING](./TROUBLESHOOTING.md#scenario-c-i-see-different-versions-on-different-computers) |
| **Need to set up GitHub Pages** | [README.md](./README.md#deploy-to-github-pages-recommended) |
| **Changed JS/CSS files** | Run `./update-version.sh` then commit |

---

## 🔄 Typical Deployment Workflow

```
┌──────────────────────────────────────────────────┐
│ 1. Make changes to code locally                  │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│ 2. If you changed JS/CSS: ./update-version.sh    │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│ 3. Commit and push to main                       │
│    git add .                                      │
│    git commit -m "Your changes"                  │
│    git push origin main                          │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│ 4. WAIT 10 MINUTES for deployment                │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│ 5. Verify with: ./check-deployed-version.sh      │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│ 6. Hard refresh browser (Ctrl+F5)                │
└──────────────────────────────────────────────────┘
```

---

## ⚠️ Common Mistakes

### ❌ Don't Do This:
1. Push code and immediately check browser (deployment takes 10 minutes!)
2. Check browser without hard refresh (you'll see cached version)
3. Assume changes are live just because they're on GitHub
4. Update `main` when site deploys from `gh-pages` (check which branch!)
5. Forget to run `./update-version.sh` after changing JS/CSS files

### ✅ Do This Instead:
1. Push code → **Wait 10 minutes** → Run version checker → Hard refresh
2. Always use hard refresh (Ctrl+F5) or incognito mode for testing
3. Verify deployment with `./check-deployed-version.sh`
4. Check GitHub Pages settings to confirm which branch deploys
5. Always run `./update-version.sh` after JS/CSS changes

---

## 🎓 Understanding the System

### Three Separate Things That Must Sync:

1. **Your Local Code**: What you see in your editor
2. **GitHub Repository**: What's at `github.com/scott-a11y/proposal-builder`
3. **Deployed Site**: What users see at `scott-a11y.github.io/proposal-builder/`

**These are NOT the same thing!**

Changes flow: Local → GitHub → Deployed Site (takes 10-20 minutes)

### Cache-Busting System:

All JS and CSS files have version parameters:
```html
<script src="./role-mode.js?v=202510010442"></script>
                                ↑
                         This is the version
```

When this version changes, browsers fetch fresh files. Run `./update-version.sh` to update all version parameters automatically.

---

## 📞 Getting Help

### Before Asking for Help:

1. ✅ Run `./check-deployed-version.sh` and share the output
2. ✅ Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. ✅ Check [GitHub Actions](https://github.com/scott-a11y/proposal-builder/actions) for failures
4. ✅ Try hard refresh (Ctrl+F5) and incognito mode
5. ✅ Wait at least 10 minutes after pushing

### When Opening an Issue:

Include:
- Output of `./check-deployed-version.sh`
- URL you're viewing
- Expected vs actual version numbers
- Screenshot of browser DevTools Network tab
- Which branch your hosting deploys from

---

## 🚀 Quick Links

- **Repository**: https://github.com/scott-a11y/proposal-builder
- **GitHub Pages**: https://scott-a11y.github.io/proposal-builder/ (if enabled)
- **Settings**: https://github.com/scott-a11y/proposal-builder/settings/pages
- **Actions**: https://github.com/scott-a11y/proposal-builder/actions

---

**Remember**: Code on GitHub ≠ Live deployed site. Always verify with `./check-deployed-version.sh`!
