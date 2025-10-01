# Emergency Rollback Procedure

**Last Updated**: October 1, 2025  
**Status**: Ready for use during freeze  

---

## Overview

This document provides step-by-step instructions for rolling back the application to a known stable state in case of critical failures.

⚠️ **WARNING**: Rollback is a last resort. Only use if the site is completely non-functional and immediate restoration is required.

---

## Pre-Rollback Checklist

Before rolling back, verify:

- [ ] Issue is truly critical (site completely broken)
- [ ] Issue cannot be fixed with a quick hotfix
- [ ] You have identified the last known stable commit
- [ ] You have notified all stakeholders
- [ ] You have documented the current broken state
- [ ] You have backup of current localStorage data (if needed)

---

## Current State Snapshot

### Last Known Stable Version
```
Version: 202510010442
Commit: cea4fd3
Branch: main
Date: October 1, 2025
Description: Merge PR #73 - last state before freeze
```

### Previous Stable Versions
```
To be documented by maintainer:
- Version: [previous stable version]
  Commit: [commit hash]
  Date: [date]
  Description: [why this was stable]
```

---

## Rollback Methods

### Method 1: Revert to Specific Commit (RECOMMENDED)

This method creates a new commit that reverses changes, preserving history.

```bash
# 1. Identify the commit to revert TO (last stable)
git log --oneline

# 2. Create a revert commit (reverses changes since stable)
git revert --no-commit <bad-commit>..<current-commit>
git commit -m "EMERGENCY ROLLBACK: Revert to stable version cea4fd3"

# 3. Push to main (this will trigger deployment)
git push origin main

# 4. Wait 5-10 minutes for deployment to complete

# 5. Verify rollback
./check-deployed-version.sh
```

**Pros**:
- ✅ Preserves git history
- ✅ Can be undone if needed
- ✅ Audit trail maintained

**Cons**:
- ⚠️ May have merge conflicts if many changes
- ⚠️ Requires manual conflict resolution

---

### Method 2: Force Reset to Stable Commit (USE WITH CAUTION)

This method completely resets to a previous state. Use only if Method 1 fails.

```bash
# 1. BACKUP current state first
git branch backup/pre-rollback-$(date +%Y%m%d%H%M)
git push origin backup/pre-rollback-$(date +%Y%m%d%H%M)

# 2. Reset to stable commit (LOCAL ONLY)
git checkout main
git reset --hard cea4fd3

# 3. Force push (⚠️ DESTRUCTIVE - use with caution)
# This requires force push permissions
git push --force origin main

# 4. Wait 5-10 minutes for deployment

# 5. Verify rollback
./check-deployed-version.sh
```

**Pros**:
- ✅ Clean slate, guaranteed to match stable state
- ✅ No merge conflicts

**Cons**:
- ❌ Loses git history of bad commits
- ❌ Cannot easily undo
- ❌ May require force push permissions
- ❌ Team members must force pull

---

### Method 3: Deploy from Stable Branch

This method uses a separate stable branch for quick rollback.

**Setup (one-time)**:
```bash
# Create stable branch from last known good commit
git checkout cea4fd3
git checkout -b stable
git push origin stable

# Configure GitHub Pages to deploy from stable branch
# Go to: Settings → Pages → Source → stable branch
```

**Rollback Process**:
```bash
# 1. Identify stable commit
git log stable --oneline

# 2. Update stable branch to known good commit
git checkout stable
git reset --hard cea4fd3
git push --force origin stable

# 3. GitHub Pages automatically redeploys from stable
# 4. Main branch remains unchanged for investigation
```

**Pros**:
- ✅ Main branch preserved for debugging
- ✅ Quick rollback without affecting main
- ✅ Can test fixes on main without affecting production

**Cons**:
- ⚠️ Requires one-time setup
- ⚠️ Need to remember to update stable after verified changes

---

### Method 4: Manual File Replacement

Emergency method if git access is unavailable.

```bash
# 1. Download stable version files from GitHub
curl -o index.html https://raw.githubusercontent.com/scott-a11y/proposal-builder/cea4fd3/index.html
curl -o admin-addon.js https://raw.githubusercontent.com/scott-a11y/proposal-builder/cea4fd3/admin-addon.js
# ... (repeat for all critical files)

# 2. Update version to force cache refresh
./update-version.sh

# 3. Commit and push
git add .
git commit -m "EMERGENCY: Manual rollback to stable version"
git push origin main
```

**Pros**:
- ✅ Works without advanced git knowledge
- ✅ Can selectively rollback specific files

**Cons**:
- ❌ Tedious for many files
- ❌ Easy to miss files
- ❌ Version inconsistencies possible

---

## Post-Rollback Steps

After rolling back, follow these steps:

### 1. Verify Rollback Success

```bash
# Check deployed version
./check-deployed-version.sh

# Expected output:
# 📁 Local version: [new version after rollback]
# 🌐 GitHub Pages: [new version after rollback]
# ✅ UP TO DATE
```

### 2. Test Core Functionality

Manually test:
- [ ] Site loads without errors
- [ ] Forms can be filled out
- [ ] Preview generation works
- [ ] PDF export works
- [ ] Logo displays correctly
- [ ] Admin panel accessible
- [ ] No JavaScript console errors

### 3. Communicate Rollback

Notify:
- [ ] Repository owner (scott-a11y)
- [ ] All contributors
- [ ] Any users who reported issues
- [ ] Update freeze status in FREEZE.md

### 4. Document What Happened

Create a post-mortem document:
```markdown
# Rollback Post-Mortem

**Date**: [date]
**Rolled back from**: [bad commit]
**Rolled back to**: [stable commit]
**Method used**: [which method]
**Reason**: [why rollback was needed]
**Issues that caused rollback**:
- Issue 1: [description]
- Issue 2: [description]

**Lessons learned**:
- What went wrong
- How to prevent in future
- What worked well
```

### 5. Investigation

Do NOT immediately try to fix:
- Take time to understand what went wrong
- Review all changes between stable and broken
- Test changes in isolation on a branch
- Get second opinion before merging fixes

---

## Rollback Decision Matrix

Use this matrix to decide if rollback is needed:

| Issue Severity | User Impact | Rollback Recommended? |
|---------------|-------------|----------------------|
| Site won't load | 100% blocked | ✅ YES - Immediate |
| Critical feature broken (PDF export) | 80%+ blocked | ⚠️ MAYBE - Assess |
| UI glitch | Minor inconvenience | ❌ NO - Fix instead |
| Console errors (no visible impact) | None | ❌ NO - Fix instead |
| Performance degradation | Slow but usable | ❌ NO - Optimize |
| Security vulnerability | Potential risk | ⚠️ MAYBE - Urgent fix or rollback |

---

## Prevention

To avoid needing rollback in the future:

### 1. Staging Environment
```yaml
# Create staging deployment in .github/workflows/
# Deploy to staging first, verify, then production
```

### 2. Manual Approval Gates
```yaml
# Require manual approval before production deploy
environment:
  name: github-pages
  required-reviewers: [scott-a11y]
```

### 3. Canary Deployments
- Deploy to 10% of users first
- Monitor for issues
- Full rollout only if stable

### 4. Automated Testing
- Add browser-based tests (Playwright/Cypress)
- Test critical paths before deploy
- Block deployment if tests fail

### 5. Feature Flags
```javascript
// Disable features without redeployment
window.FEATURES = {
  pdfExport: true,
  logoUpload: true,
  autoSave: true
};
```

---

## Emergency Contacts

If you need help with rollback:

- **Repository Owner**: scott-a11y
- **GitHub Support**: https://support.github.com/
- **Emergency Issue**: Open with tag [CRITICAL]

---

## Quick Reference Commands

```bash
# Check current deployed version
./check-deployed-version.sh

# View recent commits
git log --oneline -20

# Create backup branch before rollback
git branch backup/pre-rollback-$(date +%Y%m%d%H%M)

# Revert to specific commit (safe method)
git revert --no-commit <bad-commit>..<current-commit>
git commit -m "ROLLBACK: Revert to stable"
git push origin main

# Reset to specific commit (destructive method)
git reset --hard <stable-commit>
git push --force origin main

# Update version after any changes
./update-version.sh
```

---

## Testing Rollback Procedure

It's important to test the rollback procedure before you need it:

### Rollback Drill (In Staging)

1. Create test branch
2. Make intentional breaking change
3. Practice rolling back
4. Verify process works
5. Time how long it takes
6. Document any issues with procedure

**Target**: Complete rollback in under 10 minutes

---

## Appendix: Common Rollback Scenarios

### Scenario 1: Bad Deployment After Merge
```bash
# PR merged but broke production
git log --oneline  # Find the merge commit
git revert -m 1 <merge-commit>  # Revert the merge
git push origin main
```

### Scenario 2: Multiple Bad Commits
```bash
# Several commits are broken
git revert --no-commit HEAD~3..HEAD  # Revert last 3 commits
git commit -m "ROLLBACK: Revert last 3 commits"
git push origin main
```

### Scenario 3: Unknown What Broke
```bash
# Not sure which commit broke it
git bisect start
git bisect bad HEAD  # Current state is bad
git bisect good cea4fd3  # This commit was good
# Git will checkout commits to test
# Test each and mark: git bisect good/bad
git bisect reset  # When done
```

### Scenario 4: Only One File Broken
```bash
# Just one file needs rollback
git checkout cea4fd3 -- admin-addon.js
./update-version.sh
git commit -m "ROLLBACK: Restore stable admin-addon.js"
git push origin main
```

---

**Remember**: Rollback is a last resort. Always try to fix forward if possible. But when the site is down, don't hesitate to rollback and investigate later.

---

End of Rollback Procedure
