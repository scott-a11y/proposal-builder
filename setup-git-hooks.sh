#!/bin/bash
# Setup Git Hooks for Automatic Cache-Busting Version Updates
# Run this script once to install the pre-push hook

HOOK_FILE=".git/hooks/pre-push"

echo "🔧 Installing Git pre-push hook for cache-busting..."

cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
# Pre-push hook to ensure cache-busting version is up to date

echo "🔍 Checking cache-busting version..."

# Get current version from index.html
CURRENT_VERSION=$(grep -oP '<!-- Version: \K[0-9]+' index.html 2>/dev/null)

if [ -z "$CURRENT_VERSION" ]; then
    echo "⚠️  Warning: Could not find version in index.html"
    echo "Skipping cache-busting check..."
    exit 0
fi

# Get today's date (just the date part for comparison)
TODAY=$(date +%Y%m%d)
VERSION_DATE="${CURRENT_VERSION:0:8}"

# Check if version is from today
if [ "$VERSION_DATE" != "$TODAY" ]; then
    echo ""
    echo "⚠️  Cache-busting version is outdated!"
    echo "   Current: $CURRENT_VERSION (from $VERSION_DATE)"
    echo "   Today:   $TODAY"
    echo ""
    echo "Would you like to update it now? [Y/n]"
    
    read -r response
    case "$response" in
        [nN][oO]|[nN])
            echo "❌ Push cancelled. Please update version manually with: ./update-version.sh"
            exit 1
            ;;
        *)
            echo "🔄 Updating version..."
            ./update-version.sh
            
            # Add the updated files to git
            git add index.html admin-loader.js test-cache-busting.sh
            
            echo ""
            echo "✅ Version updated! Please commit these changes and push again."
            echo ""
            echo "Run:"
            echo "  git commit -m 'chore: update cache-busting version'"
            echo "  git push"
            exit 1
            ;;
    esac
fi

echo "✅ Cache-busting version is up to date ($CURRENT_VERSION)"
exit 0
EOF

# Make the hook executable
chmod +x "$HOOK_FILE"

echo "✅ Git pre-push hook installed successfully!"
echo ""
echo "The hook will:"
echo "  1. Check cache-busting version before every push"
echo "  2. Prompt you to update if outdated"
echo "  3. Automatically run update-version.sh if you accept"
echo ""
echo "To remove the hook later, delete: $HOOK_FILE"
