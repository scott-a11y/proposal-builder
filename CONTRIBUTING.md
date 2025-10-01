# Contributing to Proposal Builder

Thank you for your interest in contributing to the Foundry Cabinet Co Proposal Builder! This document provides guidelines for human contributors.

> **Note**: If you're using GitHub Copilot or an AI coding assistant, please refer to [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) for comprehensive technical guidance.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Code Guidelines](#code-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Need Help?](#need-help)

## Getting Started

This is a single-file HTML application with no build process. You can start contributing with just a web browser!

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Basic knowledge of HTML, CSS, and vanilla JavaScript
- (Optional) Python 3 for running a local HTTP server

### Quick Start

1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/proposal-builder.git
   cd proposal-builder
   ```

2. **Open the application**:
   - Option A: Open `index.html` directly in your browser
   - Option B: Run a local server:
     ```bash
     python3 -m http.server 8080
     # Then visit http://localhost:8080
     ```

3. **Access the admin panel**:
   - Look for the "ADMIN" button in the bottom-right corner
   - If not visible, run `window.switchToAdmin()` in the browser console
   - Or add `?role=admin` to the URL

4. **Run tests**:
   - Open `/tests.html` in your browser
   - All tests should pass with the main branch

## Development Setup

No installation required! The application runs entirely in the browser with no dependencies.

### File Organization

```
index.html              # Main application (single-file app)
role-mode.js            # Role detection and mode switching
admin-addon.js          # Admin panel with IndexedDB asset management
admin-loader.js         # Lazy loads admin-addon.js
config-loader.js        # Configuration management
proposal-guard.js       # Data validation and security
share-link.js           # Link sharing functionality

brand.css               # Brand styling and color palette
presentation.css        # Presentation mode styles
print.css               # Print/PDF export styles

tests.html              # Test suite (client-side testing)
```

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check if the issue exists in the latest version
2. Try hard-refreshing your browser (Ctrl+F5 or Cmd+Shift+R)
3. Check the browser console for errors
4. Review existing issues to avoid duplicates

When creating a bug report, include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Console errors (if any)
- Current role (Admin/Agent/Client)

### Suggesting Features

Feature suggestions are welcome! Please:
- Check existing issues and PRs first
- Explain the use case and benefits
- Consider if it fits the "single-file, no-build" philosophy
- Be open to discussion and feedback

### Pull Requests

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**:
   - Keep changes focused and minimal
   - Follow existing code style
   - Update tests if needed
   - Update documentation if behavior changes

3. **Update cache-busting** (if you modified JS/CSS):
   ```bash
   ./update-version.sh
   # This updates the version timestamp in index.html
   ```

4. **Test your changes**:
   - Open `tests.html` and verify all tests pass
   - Test in all three roles: Admin, Agent, Client
   - Test HTML and PDF exports
   - Check console for errors
   - Test in multiple browsers if possible

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

6. **Push and create a PR**:
   ```bash
   git push origin your-branch-name
   ```
   Then open a Pull Request on GitHub

## Code Guidelines

### JavaScript

- Use **vanilla JavaScript ES6+** (no frameworks)
- Wrap code in IIFE: `(() => { 'use strict'; ... })()`
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Always escape user input with `escapeHtml()` function
- Use `safe()` function for filename sanitization

### HTML/CSS

- Use semantic HTML5 elements
- Follow existing CSS class naming conventions
- Use CSS variables for theming (defined in `brand.css`)
- Keep inline styles to a minimum
- Ensure responsive design

### Security

⚠️ **Critical**: This application handles user data

- **Always escape HTML**: Use `escapeHtml()` for user input
- **Sanitize filenames**: Use `safe()` for file exports
- **No eval()**: Never use `eval()` or `Function()` constructors
- **Validate input**: Check and sanitize all user input
- **External links**: Use `rel="noopener noreferrer"`

### What NOT to Do

❌ **Don't add dependencies** (jQuery, React, etc.)
❌ **Don't add build steps** (webpack, babel, npm scripts)
❌ **Don't use `innerHTML`** directly with user input
❌ **Don't store sensitive data** in localStorage
❌ **Don't break the single-file architecture**

## Testing

### Running Tests

Open `/tests.html` in your browser. The test suite includes:
- Utility function validation
- XSS prevention mechanisms
- Data structure validation
- Error handling functionality

### Manual Testing Checklist

Before submitting a PR, verify:

- [ ] All tests in `tests.html` pass
- [ ] Application works in Admin role
- [ ] Application works in Agent role
- [ ] Application works in Client role
- [ ] HTML export works correctly
- [ ] PDF export works correctly
- [ ] No console errors or warnings
- [ ] Changes work in Chrome
- [ ] Changes work in Firefox (if possible)
- [ ] Cache-busting version updated (if JS/CSS changed)

### Testing Roles

Switch between roles to test permissions:

```javascript
// In browser console:
window.switchToAdmin()     // Switch to Admin role
window.switchToAgent()     // Switch to Agent role
window.switchToClient()    // Switch to Client role

// Check current role:
localStorage.getItem('foundry-user-role')

// Reset everything:
localStorage.clear()
location.reload()
```

## Submitting Changes

### PR Title Format

- `Fix: [Brief description of bug fix]`
- `Feature: [Brief description of new feature]`
- `Docs: [Brief description of documentation change]`
- `Refactor: [Brief description of code improvement]`

### PR Description

Include:
- **What**: Summary of changes
- **Why**: Reason for the change
- **How**: Approach taken
- **Testing**: How you tested the changes
- **Screenshots**: If UI changed

### Review Process

1. Automated CI checks must pass
2. Maintainer review (may request changes)
3. Testing by maintainer
4. Merge (if approved)

### After Merge

- Your changes will be deployed automatically
- Thank you for contributing! 🎉

## Need Help?

- **Technical questions**: Check [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)
- **Admin access issues**: See [`ADMIN_ACCESS_GUIDE.md`](./ADMIN_ACCESS_GUIDE.md)
- **Cache issues**: See [`CACHE_BUSTING_GUIDE.md`](./CACHE_BUSTING_GUIDE.md)
- **Deployment questions**: See [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Stuck?**: Open an issue with your question

## Code of Conduct

- Be respectful and professional
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Keep discussions on-topic
- Respect the project's architecture decisions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Proposal Builder!** 🚀

Built with ❤️ for Foundry Cabinet Co
