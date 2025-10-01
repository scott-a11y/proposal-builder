# Legacy Version 1

**Preserved**: October 1, 2025  
**Version**: 202510010442  
**Commit**: cea4fd3

---

## About This Directory

This directory contains the complete working version of the Proposal Builder application as it existed before the rebuild process began.

### Why This Exists

During the systematic rebuild (see `/REBUILD_PROCESS.md`), the current version was preserved here for:
1. **Reference**: Developers can refer to the original implementation
2. **Testing**: Compare new rebuild with original functionality
3. **Rollback**: Emergency restoration if needed
4. **Documentation**: Shows the evolution of the application

### What's Included

- `index.html` - Main application file (87KB, single-file architecture)
- `*.js` - All JavaScript modules (admin-addon, role-mode, etc.)
- `*.css` - All stylesheets (brand, print, presentation)

### How to Use

To run this legacy version locally:
```bash
cd legacy/v1
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

### Known Issues (At Time of Preservation)

From the audit report at the time of freeze:
1. PDF export formatting inconsistencies (page bleed, header issues)
2. Admin logo selection/display problems
3. UI glitches in various components
4. Cache-busting confusion among users
5. Image encoding/decoding fragility

See `/AUDIT_REPORT.md` for comprehensive analysis.

---

## Rebuild Context

**Current Phase**: Phase 1 - Foundation & Core Editor  
**Expected Completion**: 6 weeks from start  
**Rebuild Plan**: See `/REBUILD_PROCESS.md`

### Key Changes Expected

1. **Phase 1**: Clean structure, stable core editor
2. **Phase 2**: Fixed PDF export and print formatting
3. **Phase 3**: Reliable asset management
4. **Phase 4**: Enhanced features (share links, presentation mode)
5. **Phase 5**: Testing and deployment

---

**Note**: This is a snapshot only. Do not make changes here. All development should follow the rebuild plan.
