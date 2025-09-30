#!/bin/bash
# Cache-Busting Verification Test
# This script verifies that all CSS and JS files have cache-busting version parameters

echo "🔍 Cache-Busting Verification Test"
echo "==================================="
echo ""

# Set expected version
EXPECTED_VERSION="20250930"
PASSED=0
FAILED=0

# Function to test file reference
test_file_ref() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file"; then
        echo "✅ PASS: $description"
        ((PASSED++))
    else
        echo "❌ FAIL: $description"
        echo "   Expected: $pattern"
        ((FAILED++))
    fi
}

echo "Testing index.html..."
echo "-------------------"

# Test CSS files
test_file_ref "index.html" "brand.css?v=$EXPECTED_VERSION" "brand.css has version parameter"
test_file_ref "index.html" "presentation.css?v=$EXPECTED_VERSION" "presentation.css has version parameter"
test_file_ref "index.html" "print.css?v=$EXPECTED_VERSION" "print.css has version parameter"

# Test JS files
test_file_ref "index.html" "role-mode.js?v=$EXPECTED_VERSION" "role-mode.js has version parameter"
test_file_ref "index.html" "config-loader.js?v=$EXPECTED_VERSION" "config-loader.js has version parameter"
test_file_ref "index.html" "proposal-guard.js?v=$EXPECTED_VERSION" "proposal-guard.js has version parameter"
test_file_ref "index.html" "share-link.js?v=$EXPECTED_VERSION" "share-link.js has version parameter"
test_file_ref "index.html" "img-placeholder-sanitizer.js?v=$EXPECTED_VERSION" "img-placeholder-sanitizer.js has version parameter"
test_file_ref "index.html" "admin-loader.js?v=$EXPECTED_VERSION" "admin-loader.js has version parameter"

# Test version comment
test_file_ref "index.html" "<!-- Version: $EXPECTED_VERSION -->" "Version comment is present"

echo ""
echo "Testing admin-loader.js..."
echo "-------------------------"

# Test admin-addon.js
test_file_ref "admin-loader.js" "admin-addon.js?v=$EXPECTED_VERSION" "admin-addon.js has version parameter"

# Test improved selector
test_file_ref "admin-loader.js" 'script\[src\*="admin-addon.js"\]' "Selector supports version parameters"

echo ""
echo "Checking for files without version parameters..."
echo "-----------------------------------------------"

# Check for any .js or .css references without version parameters (excluding external URLs and data URIs)
if grep -E 'src="\.\/[^"]+\.js"' index.html > /dev/null 2>&1; then
    echo "❌ FAIL: Found JS files without version parameters"
    grep -E 'src="\.\/[^"]+\.js"' index.html
    ((FAILED++))
else
    echo "✅ PASS: No JS files found without version parameters"
    ((PASSED++))
fi

if grep -E 'href="\.\/[^"]+\.css"' index.html > /dev/null 2>&1; then
    echo "❌ FAIL: Found CSS files without version parameters"
    grep -E 'href="\.\/[^"]+\.css"' index.html
    ((FAILED++))
else
    echo "✅ PASS: No CSS files found without version parameters"
    ((PASSED++))
fi

echo ""
echo "Testing that version is consistent..."
echo "------------------------------------"

# Count occurrences of the version
VERSION_COUNT=$(grep -o "?v=$EXPECTED_VERSION" index.html | wc -l)
if [ "$VERSION_COUNT" -eq 9 ]; then
    echo "✅ PASS: Version $EXPECTED_VERSION appears 9 times in index.html (3 CSS + 6 JS)"
    ((PASSED++))
else
    echo "❌ FAIL: Version $EXPECTED_VERSION appears $VERSION_COUNT times (expected 9)"
    ((FAILED++))
fi

ADMIN_VERSION_COUNT=$(grep -o "?v=$EXPECTED_VERSION" admin-loader.js | wc -l)
if [ "$ADMIN_VERSION_COUNT" -eq 1 ]; then
    echo "✅ PASS: Version $EXPECTED_VERSION appears 1 time in admin-loader.js"
    ((PASSED++))
else
    echo "❌ FAIL: Version $EXPECTED_VERSION appears $ADMIN_VERSION_COUNT times in admin-loader.js (expected 1)"
    ((FAILED++))
fi

echo ""
echo "==================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "==================================="

if [ $FAILED -eq 0 ]; then
    echo "✅ All cache-busting tests passed!"
    exit 0
else
    echo "❌ Some cache-busting tests failed!"
    exit 1
fi
