#!/bin/bash
# Automated Cache-Busting Version Updater
# This script updates all cache-busting version parameters to a timestamp-based version

# Generate timestamp-based version (YYYYMMDDHHmm format)
NEW_VERSION=$(date +%Y%m%d%H%M)

echo "🔄 Updating cache-busting version to: $NEW_VERSION"
echo "================================================"

# Update version comment in index.html
sed -i "s/<!-- Version: [0-9]* -->/<!-- Version: $NEW_VERSION -->/g" index.html
echo "✅ Updated version comment in index.html"

# Update all version parameters in index.html
sed -i "s/\?v=[0-9]*/?v=$NEW_VERSION/g" index.html
echo "✅ Updated all CSS and JS version parameters in index.html"

# Update version parameter in admin-loader.js
sed -i "s/\?v=[0-9]*/?v=$NEW_VERSION/g" admin-loader.js
echo "✅ Updated version parameter in admin-loader.js"

# Update expected version in test script
sed -i "s/EXPECTED_VERSION=\"[0-9]*\"/EXPECTED_VERSION=\"$NEW_VERSION\"/g" test-cache-busting.sh
echo "✅ Updated expected version in test-cache-busting.sh"

echo ""
echo "================================================"
echo "✅ Version successfully updated to: $NEW_VERSION"
echo ""
echo "Next steps:"
echo "1. Run: ./test-cache-busting.sh to verify changes"
echo "2. Commit and push changes to deploy"
echo "3. Ask users to refresh their browsers (Ctrl+F5 or Cmd+Shift+R)"
