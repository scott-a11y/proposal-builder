# Copilot Instructions for Proposal Builder

## Project Overview

This is **Foundry Cabinet Co - Proposal Builder**, a single-file HTML application for creating professional cabinet proposals with modern features and performance optimizations. The application is designed to be self-contained, requiring no build process, and can be served as static files.

### Key Characteristics
- **Single-file architecture**: Primary application in `index.html` with modular JS/CSS files
- **No build process**: Uses vanilla JavaScript with optional React UMD
- **Static file deployment**: Designed for GitHub Pages, Netlify, or any static hosting
- **localStorage-based**: Data persistence using browser localStorage + optional Supabase integration
- **Role-based access**: Admin, Agent, and Client roles with different permissions

## Architecture & Tech Stack

### Frontend
- **JavaScript**: Vanilla JavaScript (ES6+), no frameworks required
- **React**: Optional React 18 UMD for future enhancements (currently commented out)
- **CSS**: Custom CSS files with Tailwind-inspired utility classes
- **Storage**: localStorage for proposals, IndexedDB for assets (via admin-addon.js)

### Dependencies

**Runtime Dependencies**: NONE (runs in browser, no npm/node required)
- All code is vanilla JavaScript ES6+
- No build process or compilation step
- No package.json or node_modules
- Optional CDN links for React/Tailwind (commented out)

**Development Dependencies**: NONE (optional for convenience)
- Python 3 HTTP server for local testing (optional)
- Any modern web browser for testing
- No linting tools required (follow existing code style)
- No testing framework (tests.html uses custom test runner)

### File Structure
```
index.html              # Main application (single-file app)
role-mode.js            # Role detection and mode switching
admin-addon.js          # Admin panel with IndexedDB asset management
admin-loader.js         # Lazy loads admin-addon.js
config-loader.js        # Configuration management
proposal-guard.js       # Data validation and security
share-link.js           # Link sharing functionality
img-placeholder-sanitizer.js  # Image handling utilities

brand.css               # Brand styling and color palette
presentation.css        # Presentation mode styles
print.css               # Print/PDF export styles

tests.html              # Test suite (client-side testing)
```

### Key Patterns
- **Cache-busting**: All CSS/JS files use `?v=YYYYMMDDHHmm` version parameters
- **Lazy loading**: Admin panel loaded only when needed
- **XSS prevention**: HTML escaping via `escapeHtml()` function
- **Safe filenames**: Sanitization via `safe()` function for exports

## Development Workflow

### Issue & PR Workflow

1. **Issue Analysis**
   - Read the entire issue including all comments
   - Check for related issues or PRs
   - Understand the "why" not just the "what"
   - Ask clarifying questions if needed

2. **Planning Phase**
   - Create a checklist of tasks
   - Identify files that need changes
   - Estimate impact and risk
   - Use `report_progress` to share plan early

3. **Implementation Phase**
   - Make small, incremental changes
   - Test after each change
   - Commit frequently with `report_progress`
   - Keep commits focused (one logical change per commit)

4. **Verification Phase**
   - Run tests in browser (`tests.html`)
   - Test in all three roles (admin/agent/client)
   - Test exports (HTML and PDF)
   - Check console for errors
   - Verify cache-busting updated if needed

5. **Documentation Phase**
   - Update relevant .md files if behavior changed
   - Add comments for complex logic
   - Update PR description with final status
   - Include screenshots for UI changes

### Making Changes

1. **Before any changes**: Check `CACHE_BUSTING_GUIDE.md` if modifying JS/CSS files
2. **Code changes**: Modify the relevant file(s)
3. **Version update**: If JS/CSS changed, run `./update-version.sh` or manually update version
4. **Testing**: Open `tests.html` in browser to run test suite
5. **Manual testing**: Open `index.html` and test functionality

### Version Management

**IMPORTANT**: When modifying JavaScript or CSS files:
- Update cache-busting version using `./update-version.sh`
- Or manually update version in `index.html` header comment and all `?v=` parameters
- Version format: `YYYYMMDDHHmm` (timestamp)
- See `CACHE_BUSTING_GUIDE.md` for details

### Testing

- **Automated tests**: Open `/tests.html` in a browser
- **Test coverage**: Utility functions, XSS prevention, data validation, error handling
- **Manual testing**: Use the application in different roles (admin/agent/client)
- **Role switching**: Use `window.switchToAdmin()` in console or `?role=admin` URL parameter

## Code Style & Conventions

### JavaScript
- Use strict mode: `'use strict'`
- ES6+ features: arrow functions, template literals, const/let
- Avoid global scope pollution: wrap in IIFE `(() => { ... })()`
- Function naming: camelCase for functions, UPPER_CASE for constants
- Comments: JSDoc-style for complex functions

### HTML/CSS
- Semantic HTML5 elements
- CSS variables for theming (defined in `brand.css`)
- Utility-first CSS classes inspired by Tailwind
- Responsive design principles

### Security
- Always use `escapeHtml()` for user input in HTML templates
- Use `safe()` for filename sanitization
- Follow CSP (Content Security Policy) requirements
- External links must use `rel="noopener noreferrer"`

## Common Tasks

### Adding a New Feature
1. Determine if it affects core app (`index.html`) or admin panel (`admin-addon.js`)
2. Add necessary HTML structure/CSS styles
3. Implement JavaScript functionality
4. Add input validation and XSS prevention
5. Update tests in `tests.html` if applicable
6. Update relevant documentation files
7. Update cache-busting version if JS/CSS modified

### Fixing Bugs
1. Reproduce the issue
2. Check browser console for errors
3. Verify issue isn't cache-related (hard refresh: Ctrl+F5)
4. Make minimal fix
5. Test in all roles (admin/agent/client)
6. Update cache-busting version if needed

### Adding New Role Permissions
1. Modify `role-mode.js` role definitions
2. Update permission checks in affected components
3. Test role switching and permission enforcement
4. Update `ADMIN_ACCESS_GUIDE.md` if needed

## Important Files & Their Purpose

### Documentation
- `README.md` - Main documentation and getting started guide
- `CACHE_BUSTING_GUIDE.md` - How to manage file versions
- `ADMIN_ACCESS_GUIDE.md` - Role switching and admin access
- `DEPLOYMENT.md` - Production deployment instructions
- `LOGO_VARIANT_GUIDE.md` - Logo management (dark/light variants)

### Scripts
- `update-version.sh` - Automated cache-busting version update
- `test-cache-busting.sh` - Verify all files have version parameters

### Core Application
- `index.html` - Main application (1800+ lines, self-contained)
- `role-mode.js` - Role system (admin/agent/client)
- `admin-addon.js` - Admin panel with IndexedDB asset management

## Brand Guidelines

### Color Palette
- **Midnight**: `#0B1120` (primary dark)
- **Slate**: `#1E293B` (secondary dark)
- **Cloud**: `#F1F5F9` (light background)
- **Amber**: `#F59E0B` (accent color)

### Typography
- System UI font stack
- Proper heading hierarchy (h1-h6)
- Letter-spacing for brand consistency

## Deployment

### Static Hosting
- No build process required
- Serve all files from root directory
- Configure HTTPS for security
- Set up proper MIME types for .js, .css, .html

### Cache Control
- HTML files: No cache (`Cache-Control: no-cache, no-store, must-revalidate`)
- JS/CSS files: Long cache with version parameters (`?v=timestamp`)

### Security Headers
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Common Pitfalls to Avoid

1. **Forgetting cache-busting**: Always update version when modifying JS/CSS
2. **XSS vulnerabilities**: Always escape user input with `escapeHtml()`
3. **Breaking admin access**: Test role switching after changes
4. **localStorage limits**: Handle quota exceeded errors gracefully
5. **Browser compatibility**: Test in Chrome, Firefox, Safari, Edge
6. **Print/PDF issues**: Test export functionality after UI changes

## Repository-Specific Patterns

### Design Patterns Used

1. **IIFE (Immediately Invoked Function Expressions)**: All JS modules wrap code in `(() => { 'use strict'; ... })()`
2. **Event Delegation**: Use event listeners on parent elements, not individual elements
3. **Data Attributes**: Use `data-*` attributes for JavaScript hooks, not classes
4. **Template Literals**: Use backticks for HTML generation, always escape with `escapeHtml()`
5. **LocalStorage as Database**: Read once, modify in memory, write back

### Anti-Patterns to Avoid

❌ **Don't**: Add jQuery or other libraries (app is vanilla JS)
❌ **Don't**: Use `innerHTML` directly with user input (XSS risk)
❌ **Don't**: Add external dependencies without explicit approval
❌ **Don't**: Break the single-page architecture with multiple HTML files
❌ **Don't**: Add build steps (webpack, babel, etc.) - keep it simple
❌ **Don't**: Use `eval()` or `Function()` constructors
❌ **Don't**: Store sensitive data in localStorage (it's not encrypted)
❌ **Don't**: Assume localStorage is infinite (handle quota errors)

### Preferred Solutions

✅ **Image Storage**: Use IndexedDB (via admin-addon.js), not localStorage
✅ **HTML Generation**: Use template literals with `escapeHtml()`
✅ **Event Handling**: Use event delegation on container elements
✅ **State Management**: Single source of truth in `formData` object
✅ **File Names**: Always sanitize with `safe()` function
✅ **Error Handling**: Try/catch with user-friendly messages, log to console

## Testing Checklist

Before considering a change complete:
- [ ] Code works in admin, agent, and client roles
- [ ] No console errors or warnings
- [ ] Tests in `tests.html` pass
- [ ] Export (HTML/PDF) works correctly
- [ ] No XSS vulnerabilities introduced
- [ ] Cache-busting version updated (if JS/CSS changed)
- [ ] Documentation updated if behavior changed
- [ ] Tested in at least 2 different browsers

## Getting Help

- **Admin access issues**: See `ADMIN_ACCESS_GUIDE.md`
- **Deployment issues**: See `DEPLOYMENT.md`
- **Cache issues**: See `CACHE_BUSTING_GUIDE.md`
- **Logo management**: See `LOGO_VARIANT_GUIDE.md`
- **Test failures**: Check `tests.html` for specific test details

## Quick Reference Commands

```bash
# Update cache-busting version (after JS/CSS changes)
./update-version.sh

# Verify cache-busting configuration
./test-cache-busting.sh

# Start local server for testing
python3 -m http.server 8080
# or
npx http-server -p 8080

# Access application
open http://localhost:8080/

# Access tests
open http://localhost:8080/tests.html
```

## Browser Console Utilities

```javascript
// Switch to admin role
window.switchToAdmin()

// Check current role
console.log(localStorage.getItem('foundry-user-role'))

// Clear all data (reset app)
localStorage.clear()

// View current proposal data
JSON.parse(localStorage.getItem('foundry-last-proposal'))
```

## Notes for AI Assistants

- This is a production application used by Foundry Cabinet Co
- Prioritize backward compatibility and data safety
- Always test changes thoroughly before suggesting them
- When suggesting code changes, include cache-busting update instructions
- Respect the single-file architecture - avoid introducing build complexity
- Security is critical - always validate and sanitize user input

### Making Changes as an AI Agent

When working on issues or PRs:

1. **Understand First**: Read the issue completely, check related files, and understand the context before making changes
2. **Plan & Report**: Use `report_progress` early to outline your plan as a checklist
3. **Minimal Changes**: Make the smallest possible changes to achieve the goal
4. **Test Continuously**: Run tests after each change, not just at the end
5. **Document Progress**: Use `report_progress` frequently to commit changes and update status

### Commit Message Guidelines

- **Format**: Single line, descriptive, action-oriented
- **Good examples**: 
  - `Fix logo display in PDF export`
  - `Add template validation for admin panel`
  - `Update cache-busting version to 202410011200`
- **Bad examples**: 
  - `Fixed bug` (too vague)
  - `Updated files` (not descriptive)
  - `WIP changes` (not suitable for commits)

### PR Description Best Practices

- Use markdown checklists to track progress: `- [x]` for done, `- [ ]` for pending
- Keep the checklist structure consistent between updates
- Include what was changed, why, and how to verify
- Don't use headers in PR descriptions (just checklists)
- Update the checklist with each `report_progress` call

### Examples of Good Changes

✅ **DO**:
- Change only the specific function that has the bug
- Add targeted validation where input is received
- Update only the CSS properties that need fixing
- Add tests for the specific functionality you changed

❌ **DON'T**:
- Refactor unrelated code while fixing a bug
- Change formatting across the entire file
- Update dependencies unless specifically needed
- Add features that weren't requested

### Handling Common Scenarios

**Scenario: Logo not displaying**
- Check if logo asset exists in IndexedDB (admin panel)
- Verify `logoAssetIdDark` and `logoAssetIdLight` are set
- Test in both HTML preview (dark) and PDF export (light)
- Don't modify logo fallback SVG unless necessary

**Scenario: Export functionality broken**
- Check console for errors
- Verify image encoding functions work
- Test with different image sizes
- Check if localStorage quota is exceeded
- Don't rewrite the entire export function

**Scenario: Admin panel not accessible**
- Check `localStorage.getItem('foundry-user-role')`
- Use `window.switchToAdmin()` in console
- Verify role-mode.js is loaded correctly
- Don't modify role system unless issue specifically requires it

### File Change Impact Assessment

Before modifying a file, understand its impact:

- **index.html**: Core application, affects all users immediately
- **admin-addon.js**: Admin panel only, affects configuration
- **role-mode.js**: Role system, affects access control
- ***.css**: Visual changes, requires cache-busting update
- ***.js**: Functionality changes, requires cache-busting update
- **Documentation**: No cache-busting needed, test for accuracy

### When to Ask for Help

Stop and ask the user if:
- The issue requires architectural changes
- You need to modify multiple interconnected systems
- The fix might break backward compatibility
- You're not confident in your understanding of the issue
- Tests are consistently failing and you're not sure why
- The requested change conflicts with security best practices
