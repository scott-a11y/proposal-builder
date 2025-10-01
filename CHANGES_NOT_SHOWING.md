# 🚨 Changes Not Showing? DO THIS:

**Stop reading multiple guides. Follow these 4 steps IN ORDER.**

---

## ⚡ STEP 1: Run This Command

```bash
./check-deployed-version.sh
```

**What this does:** Checks if your code is actually deployed or just sitting in GitHub.

---

## 📖 STEP 2: Read What It Says

### If you see "⚠️ Cannot reach"

**Problem:** Your site isn't deployed to GitHub Pages yet.

**Solution:**
1. Go to: https://github.com/scott-a11y/proposal-builder/settings/pages
2. Under "Source", select: **"GitHub Actions"**
3. Click **Save**
4. Wait 5 minutes
5. Run `./check-deployed-version.sh` again

**Still can't reach?** Your site might be on Netlify or Vercel instead. Check those dashboards.

---

### If you see "❌ OUTDATED"

**Problem:** Your code is on GitHub but hasn't deployed yet.

**Solution:**
1. **Wait 10 minutes** (deployment takes time!)
2. Run `./check-deployed-version.sh` again
3. If still outdated after 10 minutes, check: https://github.com/scott-a11y/proposal-builder/actions
4. Look for failed workflows (red X) and read the error messages

---

### If you see "✅ UP TO DATE"

**Problem:** Your code is deployed! The issue is your browser cache.

**Solution:**
1. **Hard refresh:** Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
2. Still old? Try **incognito/private mode**
3. Still old? **Clear your entire browser cache**

---

## 🔧 STEP 3: Still Stuck? Check These

### Did you actually push your code?
```bash
git status        # Should say "nothing to commit, working tree clean"
git log -1        # Should show your recent commit
```

If not:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Then wait 10 minutes and run `./check-deployed-version.sh` again.

---

### Are you looking at the right URL?

Your code might be at: `https://github.com/scott-a11y/proposal-builder`

But your SITE might be at:
- `https://scott-a11y.github.io/proposal-builder/` (GitHub Pages)
- `https://something.netlify.app/` (Netlify)
- `https://something.vercel.app/` (Vercel)
- Your custom domain

**Make sure you're viewing the SITE, not the CODE repository!**

---

### Did you update JavaScript or CSS files?

If yes, the version might not auto-update. Run:
```bash
./update-version.sh
git add .
git commit -m "Update cache-busting version"
git push origin main
```

Then wait 10 minutes.

---

## 🆘 STEP 4: Emergency Help

If you did ALL of the above and it's still not working:

1. **Check GitHub Actions:** https://github.com/scott-a11y/proposal-builder/actions
   - Look for red X (failed builds)
   - Click on the failed workflow
   - Read the error message

2. **Verify your branch:**
   ```bash
   git branch  # Should show you're on "main"
   ```

3. **Check which branch is deployed:**
   - GitHub Pages Settings: https://github.com/scott-a11y/proposal-builder/settings/pages
   - Should deploy from "main" branch

4. **Force a rebuild:**
   ```bash
   git commit --allow-empty -m "Force rebuild"
   git push origin main
   ```
   Then wait 10 minutes.

---

## 💡 Why This Happens

**What you think happens:**
```
You edit code → Changes appear instantly ✅
```

**What actually happens:**
```
You edit code
  ↓
Commit & push to GitHub (1 min)
  ↓
GitHub Actions runs (5 min) ← Updates version numbers
  ↓
GitHub Pages deploys (5 min) ← Actually puts your code live
  ↓
CDN propagates (2-5 min) ← Spreads to servers worldwide
  ↓
Your browser (cached!) ← Still showing old version!
  ↓
You hard refresh ← FINALLY see changes! ✅

TOTAL TIME: 10-20 minutes
```

**This is normal!** It's not broken, it just takes time.

---

## 📋 Quick Checklist

Before panicking, verify:

- [ ] My code is committed: `git status` shows clean
- [ ] My code is pushed: `git log --oneline -5` shows my commit
- [ ] I'm on the right branch: `git branch` shows `* main`
- [ ] I waited 10+ minutes after pushing
- [ ] I ran `./check-deployed-version.sh` and read the output
- [ ] I did a hard refresh: `Ctrl + F5` or `Cmd + Shift + R`
- [ ] I tried incognito mode
- [ ] I'm viewing the SITE URL, not the GitHub repository URL

**If all checked:** Your changes are live! Your browser is just being stubborn. Try a different browser or device.

---

## 🎯 Common Mistakes

### ❌ Mistake #1: "I pushed to GitHub, why don't I see it?"
Because pushing to GitHub ≠ deploying to your live site. Wait 10 minutes.

### ❌ Mistake #2: "I refreshed the page!"
Regular refresh (F5) doesn't clear cache. Use **hard refresh** (Ctrl + F5).

### ❌ Mistake #3: "I'm looking at the GitHub page"
GitHub repository ≠ your live site. Check the correct URL!

### ❌ Mistake #4: "It's been 2 minutes, it's broken!"
Deployment takes 10-20 minutes. Be patient.

### ❌ Mistake #5: "I updated the wrong branch"
Make sure you're on `main` branch: `git checkout main`

---

## 🔍 Advanced Debugging

Only if nothing else worked:

### Check what your browser is actually loading:
1. Open browser
2. Press `F12` (DevTools)
3. Go to **Network** tab
4. Press `Ctrl + F5` to reload
5. Click on `index.html` in the list
6. Click **Response** tab
7. Search for `<!-- Version:`
8. Compare this number to: `grep -oP '<!-- Version: \K[0-9]+' index.html`

If the numbers don't match → deployment issue (see STEP 2)
If the numbers match → browser cache issue (see "✅ UP TO DATE" section)

---

## 📚 Want More Details?

This guide covers 95% of cases. For advanced scenarios:
- [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md) - Multiple deployment locations
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Specific error messages
- [WHERE_IS_MY_SITE.md](./WHERE_IS_MY_SITE.md) - Understanding code vs site
- [CACHE_BUSTING_GUIDE.md](./CACHE_BUSTING_GUIDE.md) - Version management

---

## ✅ Success Indicators

You'll know it's working when:
- `./check-deployed-version.sh` shows "✅ UP TO DATE"
- Hard refresh shows your changes
- Incognito mode shows your changes
- DevTools shows the correct version number

**That's it! Most issues are just patience + hard refresh.**
