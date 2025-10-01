# Rebuild Process Guide

**Status**: Active Rebuild Plan  
**Owner**: @scott-a11y  
**Start Date**: October 2025  
**Related**: [FREEZE.md](./FREEZE.md), [AUDIT_REPORT.md](./AUDIT_REPORT.md)

---

## Overview

This document outlines the systematic rebuild process for the Proposal Builder application. After 70+ incremental changes with persisting critical issues, a structured rebuild approach is necessary.

### Goals
1. ✅ Restore complete stability and reliability
2. ✅ Address root causes, not symptoms
3. ✅ Maintain core functionality users depend on
4. ✅ Preserve data compatibility (localStorage structure)
5. ✅ Follow proven architectural patterns

---

## Rebuild Philosophy

### What We're Keeping
- Single-page application concept
- Role-based access (Admin/Agent/Client)
- localStorage + IndexedDB storage model
- PDF/HTML export capabilities
- No-login, browser-based operation
- Core business logic and workflows

### What We're Reconsidering
- Build process (evaluate if tooling would help)
- Module organization (maintain single-file vs. modular)
- State management approach
- Testing infrastructure
- Asset management workflow

---

## Phase-Based Approach

### Phase 1: Foundation & Core Editor (Week 1-2)
**Goal**: Stable proposal editor with data persistence

#### Deliverables:
- [ ] Clean project structure (decide: single-file vs. modular)
- [ ] Form editor with all existing fields
- [ ] localStorage persistence (backward compatible)
- [ ] Role detection and switching
- [ ] Basic styling with existing brand guidelines
- [ ] Unit tests for data layer

#### Acceptance Criteria:
- [ ] All form fields save and load correctly
- [ ] No console errors
- [ ] Role switching works (admin/agent/client)
- [ ] Data from current app migrates seamlessly
- [ ] Works in Chrome, Firefox, Safari, Edge

#### Migration Plan:
```bash
# Move current app to legacy
mkdir -p legacy/v1
cp index.html legacy/v1/
cp *.js *.css legacy/v1/

# Start fresh (structure TBD based on build decision)
# Option A: Continue single-file
# Option B: Modular with build tool
```

**Status**: ✅ Migration completed - Legacy v1 preserved in `/legacy/v1/`

---

### Phase 2: Preview & Print/PDF (Week 3)
**Goal**: Professional output generation without formatting issues

#### Deliverables:
- [ ] Live HTML preview
- [ ] PDF export with correct page breaks
- [ ] Header/footer without bleed issues
- [ ] Image embedding that works reliably
- [ ] QR code generation
- [ ] Print stylesheet optimization

#### Acceptance Criteria:
- [ ] PDF export is pixel-perfect
- [ ] No page bleed on headers
- [ ] Images embed correctly in all sizes
- [ ] QR codes are scannable
- [ ] Logo displays correctly (dark/light variants)
- [ ] Multi-page proposals format correctly

#### Technical Approach:
```javascript
// Evaluate libraries:
// - jsPDF + html2canvas (current approach issues)
// - react-pdf (if moving to React)
// - Puppeteer backend (requires server)
// - CSS Paged Media (@page rules)
```

---

### Phase 3: Admin Panel & Asset Management (Week 4)
**Goal**: Reliable logo and image management

#### Deliverables:
- [ ] Admin configuration panel
- [ ] Asset upload and storage (IndexedDB)
- [ ] Logo variant management (dark/light)
- [ ] Template system
- [ ] Settings import/export
- [ ] Asset library management

#### Acceptance Criteria:
- [ ] Logo upload works consistently
- [ ] Dark/light variants switch correctly
- [ ] Assets persist across sessions
- [ ] No IndexedDB quota errors
- [ ] Settings export/import works
- [ ] Asset deletion cleans up properly

---

### Phase 4: Advanced Features (Week 5)
**Goal**: Enhanced functionality and UX

#### Deliverables:
- [ ] Share link generation
- [ ] Presentation mode
- [ ] Collaborative features (if needed)
- [ ] Enhanced security measures
- [ ] Performance optimizations
- [ ] Accessibility improvements

#### Acceptance Criteria:
- [ ] Share links work across devices
- [ ] Presentation mode is smooth
- [ ] No XSS vulnerabilities
- [ ] App loads in < 2 seconds
- [ ] WCAG 2.1 Level AA compliance
- [ ] Works on mobile devices

---

### Phase 5: Testing & Deployment (Week 6)
**Goal**: Production-ready deployment

#### Deliverables:
- [ ] Comprehensive test suite
- [ ] Migration guide for existing users
- [ ] Updated documentation
- [ ] Deployment pipeline
- [ ] Rollback procedure
- [ ] Monitoring setup

#### Acceptance Criteria:
- [ ] 80%+ test coverage
- [ ] All critical paths tested
- [ ] Docs are complete and accurate
- [ ] Staging deployment successful
- [ ] User acceptance testing passed
- [ ] Performance benchmarks met

---

## Architecture Decision

### Decision Point: Build System

**Option A: Keep No-Build Philosophy**
- ✅ Simple deployment (static files only)
- ✅ No dependencies or compilation
- ✅ Easy to understand and maintain
- ✅ Aligns with current approach
- ❌ Limited tooling and optimization
- ❌ Manual cache-busting management
- ❌ Harder to scale codebase

**Option B: Introduce Build System (Vite/Webpack)**
- ✅ Better module organization
- ✅ Automatic optimizations
- ✅ TypeScript support (if desired)
- ✅ Modern dev tools (hot reload, etc.)
- ❌ Adds complexity
- ❌ Requires Node.js for development
- ❌ Build step before deployment

**Recommendation**: Evaluate during Phase 1. If single-file approach can be cleaned up effectively, keep it. If modularity becomes critical, introduce minimal build system (Vite preferred for simplicity).

---

## PR Workflow During Rebuild

### Branch Strategy
```
main (protected)
  └── rebuild/v1 (working branch)
       ├── rebuild/v1-phase1
       ├── rebuild/v1-phase2
       ├── rebuild/v1-phase3
       └── ...
```

### PR Requirements
1. **Title Format**: `Rebuild Phase N: [Description]`
2. **Must Include**:
   - Checklist mapped to acceptance criteria
   - Screenshots/videos of UI changes
   - Test results (all passing)
   - Migration notes (if data structure changed)
   - Staging URL for testing
3. **Review Process**:
   - Human reviewer required (@scott-a11y)
   - All CI checks must pass
   - Manual testing verification
   - No force-merging allowed

### Example PR Template
```markdown
## Phase: [1-5]
## Task: [Specific deliverable]

### Changes Made
- [ ] Change 1
- [ ] Change 2

### Acceptance Criteria Met
- [ ] Criterion 1
- [ ] Criterion 2

### Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Cross-browser verified
- [ ] No regressions found

### Screenshots
[Include screenshots here]

### Migration Notes
[Any data structure changes or migration steps]

### Staging URL
https://scott-a11y.github.io/proposal-builder/staging/

### Checklist Before Merge
- [ ] Code review approved
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No console errors
- [ ] Verified in staging
```

---

## Blocking Mechanism

### Automated Protections
1. **CODEOWNERS**: All changes require @scott-a11y approval
2. **Branch Protection**:
   - Require pull request reviews (minimum 1)
   - Require conversation resolution
   - Restrict who can push to main
   - No force pushes allowed
   - No deletions allowed

3. **CI Requirements**:
   - All tests must pass
   - Linting must pass (if build system added)
   - No new console errors

### Manual Review Checklist
- [ ] PR aligns with rebuild plan
- [ ] Acceptance criteria are met
- [ ] Tests are comprehensive
- [ ] No scope creep or unrelated changes
- [ ] Documentation is updated
- [ ] Staging deployment verified
- [ ] Migration path is clear

---

## Current State Assessment

### What's Broken (From Audit)
1. PDF export formatting (page bleed, header issues)
2. Logo management (dark/light variant switching)
3. Image handling (occasional encoding failures)
4. UI inconsistencies (various glitches)
5. Test coverage gaps

### What's Working
1. Core form functionality
2. localStorage persistence
3. Role-based access control
4. Security measures (XSS prevention)
5. Cache-busting system
6. Basic export functionality

### Root Causes Identified
1. **Incremental patching**: 70+ changes without addressing fundamentals
2. **Insufficient testing**: Manual testing only, no automated coverage
3. **Complex state management**: Data scattered across multiple functions
4. **Image handling**: Encoding/decoding logic is fragile
5. **PDF generation**: Library limitations or incorrect usage

---

## Success Criteria

The rebuild is complete when:

1. ✅ All Phase 1-5 acceptance criteria are met
2. ✅ Zero critical bugs in production
3. ✅ Test coverage > 80% for critical paths
4. ✅ User acceptance testing passed
5. ✅ Documentation is complete and accurate
6. ✅ Migration from old version is seamless
7. ✅ Performance meets or exceeds baseline
8. ✅ Accessibility standards met (WCAG 2.1 Level AA)
9. ✅ Security audit passed
10. ✅ Maintainer approves production deployment

---

## Communication

### Status Updates
- Weekly progress reports in GitHub Discussions
- Phase completion announcements
- Blocker identification and escalation

### Stakeholder Communication
- Users: Advance notice of changes
- Contributors: Clear rebuild guidelines
- Maintainers: Regular sync meetings

---

## Emergency Rollback

If critical issues are discovered during rebuild:

1. **Immediate**: Revert to last known stable version (commit: cea4fd3)
2. **Assess**: Determine if issue is fixable quickly or requires rework
3. **Decide**: Fix forward vs. roll back to previous phase
4. **Communicate**: Notify all stakeholders of status

See [ROLLBACK_PROCEDURE.md](./ROLLBACK_PROCEDURE.md) for detailed steps.

---

## Timeline

- **Phase 1**: Weeks 1-2 (Foundation & Core Editor)
- **Phase 2**: Week 3 (Preview & Print/PDF)
- **Phase 3**: Week 4 (Admin Panel & Assets)
- **Phase 4**: Week 5 (Advanced Features)
- **Phase 5**: Week 6 (Testing & Deployment)

**Total Estimated Time**: 6 weeks (with buffer for testing and refinement)

**Status Check-ins**: Every Monday and Thursday

---

## Resources

- **Architecture Reference**: `.github/copilot-instructions.md`
- **Issue History**: GitHub Issues (filtered by `rebuild` label)
- **Current Audit**: [AUDIT_REPORT.md](./AUDIT_REPORT.md)
- **Freeze Status**: [FREEZE.md](./FREEZE.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Contact

- **Owner**: @scott-a11y
- **Questions**: Open a GitHub Discussion
- **Urgent Issues**: Create issue with `urgent` label

---

**Last Updated**: October 1, 2025  
**Status**: Active Rebuild - Phase 1 (In Progress)  
**Next Milestone**: Phase 1 Completion (Week 1-2)
