#!/bin/bash
# Deployment Version Checker
# Checks if your local code version matches what's actually deployed

echo "🔍 Deployment Version Checker"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from local code
LOCAL_VERSION=$(grep -oP '<!-- Version: \K[0-9]+' index.html)
echo -e "📁 Local version (in your code): ${GREEN}$LOCAL_VERSION${NC}"
echo ""

# Function to check a URL
check_url() {
    local url=$1
    local name=$2
    
    echo "🌐 Checking $name..."
    DEPLOYED_VERSION=$(curl -s -L "$url" | grep -oP '<!-- Version: \K[0-9]+' | head -1)
    
    if [ -z "$DEPLOYED_VERSION" ]; then
        echo -e "   ${YELLOW}⚠️  Cannot reach $name${NC}"
        echo "   (Site may not be deployed there, or URL is incorrect)"
    elif [ "$DEPLOYED_VERSION" = "$LOCAL_VERSION" ]; then
        echo -e "   ${GREEN}✅ $name is UP TO DATE${NC}"
        echo "   Deployed version: $DEPLOYED_VERSION"
    else
        echo -e "   ${RED}❌ $name is OUTDATED${NC}"
        echo "   Deployed version: $DEPLOYED_VERSION"
        echo "   Expected version: $LOCAL_VERSION"
        echo -e "   ${YELLOW}Action needed: Redeploy or wait for deployment to complete${NC}"
    fi
    echo ""
}

# Check GitHub Pages (default URL)
check_url "https://scott-a11y.github.io/proposal-builder/" "GitHub Pages (default)"

# Check if there's a CNAME file for custom domain
if [ -f "CNAME" ]; then
    CUSTOM_DOMAIN=$(cat CNAME)
    check_url "https://$CUSTOM_DOMAIN/" "Custom Domain ($CUSTOM_DOMAIN)"
fi

echo "=============================="
echo ""
echo "💡 How to interpret results:"
echo ""
echo -e "   ${GREEN}✅ UP TO DATE${NC} = Your changes are live!"
echo -e "   ${RED}❌ OUTDATED${NC} = Your changes aren't deployed yet"
echo -e "   ${YELLOW}⚠️  Cannot reach${NC} = Site not deployed at that URL"
echo ""
echo "📝 If you see OUTDATED:"
echo -e "   1. Make sure changes are pushed: ${GREEN}git push origin main${NC}"
echo "   2. Wait 5-10 minutes for deployment"
echo "   3. Run this script again to verify"
echo "   4. Clear browser cache (Ctrl+F5)"
echo ""
echo "🔗 Additional URLs to check manually:"
echo "   • Netlify: curl -s https://YOUR-SITE.netlify.app/ | grep -oP '<!-- Version: \K[0-9]+'"
echo "   • Vercel: curl -s https://YOUR-SITE.vercel.app/ | grep -oP '<!-- Version: \K[0-9]+'"
echo "   • Custom: curl -s https://your-custom-domain.com/ | grep -oP '<!-- Version: \K[0-9]+'"
echo ""
echo "📚 For more help, see: DEPLOYMENT_VERIFICATION.md"
