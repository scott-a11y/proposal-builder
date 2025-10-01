# Where Is My Site?

## Understanding the Difference Between "Code" and "Site"

### Your CODE is here:
```
https://github.com/scott-a11y/proposal-builder
```
This is the source code repository. **This is NOT your live website.**

### Your LIVE SITE is here (if you set up GitHub Pages):
```
https://scott-a11y.github.io/proposal-builder/
```
This is where visitors see your application. **This is your actual website.**

---

## The Problem

Many people think:
- ❌ "I updated the code on GitHub, so my site should update immediately"

The reality is:
- ✅ "I updated the code on GitHub, now I need to DEPLOY it, and THEN wait for it to propagate"

---

## The Flow

```
┌─────────────────────┐
│  1. You Edit Code   │  ← You're here when you commit/push
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Push to GitHub  │  ← Code is now on GitHub
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. GitHub Actions  │  ← Auto-updates cache-busting version
│     runs (5 min)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. Deployment      │  ← Deploys to GitHub Pages / Netlify / etc.
│     runs (5 min)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  5. CDN Propagates  │  ← Takes 2-10 minutes to reach all servers
│     (2-10 min)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  6. Your Browser    │  ← You see changes here (if cache is clear)
│     Shows Changes   │
└─────────────────────┘

TOTAL TIME: 10-20 minutes from push to visible
```

---

## How to Find Your Live Site

### Method 1: Check GitHub Pages Settings

1. Go to: https://github.com/scott-a11y/proposal-builder/settings/pages
2. Look for "Your site is live at:"
3. That's your URL!

### Method 2: Common URLs

**If using GitHub Pages:**
- `https://scott-a11y.github.io/proposal-builder/`
- OR custom domain if configured

**If using Netlify:**
- Check: https://app.netlify.com/
- Your URL will be: `https://[site-name].netlify.app/`

**If using Vercel:**
- Check: https://vercel.com/dashboard
- Your URL will be: `https://[project-name].vercel.app/`

**If using a custom server:**
- Check your server configuration
- Could be any domain you configured

### Method 3: Use the Version Checker

Run this to check all known URLs:
```bash
./check-deployed-version.sh
```

---

## Quick Test

Open your browser and try these URLs:

1. **GitHub Pages (default):**
   https://scott-a11y.github.io/proposal-builder/

2. **Check what version is there:**
   ```bash
   curl -s https://scott-a11y.github.io/proposal-builder/ | grep -oP '<!-- Version: \K[0-9]+'
   ```

3. **Compare with your local version:**
   ```bash
   grep -oP '<!-- Version: \K[0-9]+' index.html
   ```

If the numbers match → Your site is up to date!
If the numbers differ → Your site hasn't deployed yet (wait 10 minutes)

---

## Important Notes

### GitHub Pages Must Be Enabled

GitHub Pages is NOT enabled by default. You must:
1. Go to Settings → Pages
2. Select Source: "GitHub Actions"
3. Save

Without this, your site won't be deployed anywhere!

### Multiple Deployment Locations?

It's possible your site is deployed to MULTIPLE places:
- GitHub Pages: `https://scott-a11y.github.io/proposal-builder/`
- Netlify: `https://[name].netlify.app/`
- Vercel: `https://[name].vercel.app/`
- Custom domain: `https://your-domain.com/`

**Which one are you looking at?** Check the URL in your browser!

If you updated GitHub Pages but you're looking at Netlify, you won't see changes!

---

## Troubleshooting

### "I don't know where my site is deployed"

1. Check GitHub Pages settings: https://github.com/scott-a11y/proposal-builder/settings/pages
2. Check if you have a Netlify account: https://app.netlify.com/
3. Check if you have a Vercel account: https://vercel.com/dashboard
4. Ask whoever set up the site originally

### "GitHub Pages says it's disabled"

Then your site is NOT on GitHub Pages! Check:
- Netlify
- Vercel
- Custom server
- Or it's not deployed anywhere yet (you need to set it up)

### "My site is at a custom domain"

If you're using a custom domain like `proposals.foundrycabinet.com`:
1. Find where the domain is configured (DNS settings)
2. Check which hosting provider it points to
3. Update that hosting provider, not GitHub Pages

---

## Still Confused?

Run this command and read the output carefully:
```bash
./check-deployed-version.sh
```

If it says "Cannot reach", your site isn't deployed at that URL.

Then read: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
