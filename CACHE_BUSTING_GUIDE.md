# Cache Busting Guide

## Problem
Browser caching can prevent users from seeing the latest changes to JavaScript and CSS files. Even when the HTML file has cache-control headers, browsers may still cache linked JavaScript and CSS files aggressively.

## Solution
This application uses **version query parameters** to force browsers to load fresh copies of JS and CSS files when they change.

## How It Works
All JavaScript and CSS file references include a version parameter:
```html
<script src="./role-mode.js?v=20250930"></script>
<link rel="stylesheet" href="./brand.css?v=20250930">
```

When you change the version number, browsers treat it as a completely new URL and fetch the updated file instead of using the cached version.

## When to Update the Version

Update the version number whenever you make changes to any of these files:
- JavaScript files (`.js`)
- CSS files (`.css`)

**You do NOT need to update the version when:**
- Only changing HTML content in `index.html`
- Updating documentation files (`.md`)
- Making changes that don't affect JS/CSS

## How to Update the Version

### Step 1: Choose a Version Number
**Recommended: Use a timestamp in `YYYYMMDDHHmm` format for uniqueness:**
- Example: `202509301533` for September 30, 2025 at 15:33
- Run: `date +%Y%m%d%H%M` to get current timestamp

Alternative options:
- Date only in `YYYYMMDD` format: `20250930` (may cause issues with multiple deployments in one day)
- Simple incrementing number: `v1`, `v2`, `v3`, etc.

### Step 2: Update in Two Places

**1. In `index.html` (near the top):**
```html
<!-- Cache-busting version: Update this date when making changes to JS/CSS files -->
<!-- Version: 202509301533 -->  <!-- UPDATE THIS -->
```

**2. Find and replace all version parameters in `index.html`:**

Search for: `?v=20250930` (old version)
Replace with: `?v=20251001` (new version)

You should update these files:
```html
<!-- CSS Files -->
<link rel="stylesheet" href="./brand.css?v=20250930">
<link rel="stylesheet" href="./presentation.css?v=20250930">
<link rel="stylesheet" href="./print.css?v=20250930">

<!-- JavaScript Files -->
<script src="./role-mode.js?v=20250930"></script>
<script src="./config-loader.js?v=20250930"></script>
<script src="./proposal-guard.js?v=20250930"></script>
<script src="./share-link.js?v=20250930"></script>
<script src="./img-placeholder-sanitizer.js?v=20250930"></script>
<script src="./admin-loader.js?v=20250930"></script>
```

**3. Update in `admin-loader.js`:**
```javascript
s.src = './admin-addon.js?v=20250930';  // UPDATE THIS
```

### Step 3: Test
1. Clear your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Open the application in a browser
3. Check the Network tab in DevTools to confirm files are loaded with the new version parameter

## Automated Update Script

To make this easier, you can use this bash command to update all versions at once:

```bash
# Generate timestamp-based version (recommended for uniqueness)
NEW_VERSION=$(date +%Y%m%d%H%M)

# Update index.html
sed -i "s/<!-- Version: [0-9]* -->/<!-- Version: $NEW_VERSION -->/g" index.html
sed -i "s/\?v=[0-9]*/?v=$NEW_VERSION/g" index.html

# Update admin-loader.js
sed -i "s/\?v=[0-9]*/?v=$NEW_VERSION/g" admin-loader.js

echo "✅ Version updated to $NEW_VERSION"
```

**✨ Quick Method: Use the provided script**

A ready-to-use `update-version.sh` script is included in the repository:

```bash
# Simply run:
./update-version.sh
```

This will automatically:
- Generate a timestamp-based version
- Update all version parameters in `index.html`
- Update the version in `admin-loader.js`
- Update the test expected version
- Display verification instructions

Make it executable first (only needed once):
```bash
chmod +x update-version.sh
```

Or create your own script file `update-version.sh`:

```bash
#!/bin/bash
# Auto-generate timestamp-based version
NEW_VERSION=$(date +%Y%m%d%H%M)
sed -i "s/<!-- Version: [0-9]* -->/<!-- Version: $NEW_VERSION -->/g" index.html
sed -i "s/\?v=[0-9]*/?v=$NEW_VERSION/g" index.html
sed -i "s/\?v=[0-9]*/?v=$NEW_VERSION/g" admin-loader.js
sed -i "s/EXPECTED_VERSION=\"[0-9]*\"/EXPECTED_VERSION=\"$NEW_VERSION\"/g" test-cache-busting.sh
echo "✅ Version updated to $NEW_VERSION"
```

Run it:
```bash
./update-version.sh
```

## Why This Approach?

### Advantages:
✅ Simple to implement and understand
✅ Works with static file hosting (GitHub Pages, etc.)
✅ No build process required
✅ Users always get the latest version after changes
✅ No impact on functionality - just a query parameter

### Alternatives Considered:
- **Hash-based versioning**: Requires a build step to generate file hashes
- **Service Workers**: Complex setup, can cause other caching issues
- **HTTP headers only**: Doesn't work reliably for all hosting environments

## Troubleshooting

### Users Still See Old Version
1. Verify the version number changed in the browser's Network tab
2. Ask users to hard-refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
3. As a last resort, ask users to clear their browser cache

### Changed JS/CSS but Didn't Update Version
If you forgot to update the version:
1. Update the version number now
2. Ask users to hard-refresh their browsers
3. Consider documenting this in your release notes

## Best Practices

1. **Use consistent version format**: Stick to `YYYYMMDD` or `v1, v2, v3`
2. **Update version for every JS/CSS change**: Better safe than sorry
3. **Document changes**: Note what changed in your commit messages
4. **Test after updating**: Always verify files load with new version
5. **Communicate to users**: If you fix a critical bug, ask users to refresh

## Related Files
- `index.html` - Contains all version parameters for CSS/JS files
- `admin-loader.js` - Contains version parameter for admin-addon.js
- This guide - `CACHE_BUSTING_GUIDE.md`
