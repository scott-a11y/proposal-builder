# Admin Access Guide

## Problem: Can't Find the Admin Button?

The Admin button is only visible when you're in **Admin** role. If you're in a different role (Agent or Client), the button will be hidden.

## Quick Fix: Switch to Admin Mode

### Method 1: Using Browser Console (Fastest)
1. Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) to open Developer Tools
2. Click the **Console** tab
3. Type: `window.switchToAdmin()` and press Enter
4. The page will reload in Admin mode

### Method 2: Using URL Parameter
1. Add `?role=admin` to the end of your URL
2. Example: `http://localhost:8000/?role=admin`
3. Press Enter to reload the page
4. You'll be in Admin mode

### Method 3: Using forceAdmin Parameter
1. Add `?forceAdmin=true` to the end of your URL
2. Example: `http://localhost:8000/?forceAdmin=true`
3. Press Enter to reload the page
4. This forces Admin mode regardless of other settings

## How to Check Your Current Role

### Visual Indicator
Look at the **top-right corner** of the page. You'll see a colored badge showing your current role:
- 🟢 **Green** = Administrator Mode (Admin button visible)
- 🔵 **Blue** = Agent Mode (Admin button hidden)
- 🟠 **Orange** = Client Mode (Admin button hidden)

### Console Check
1. Open Browser Console (`F12`)
2. Look for a message like: `🔐 Role: admin | Mode: edit`
3. This tells you your current role and mode

### Click the Role Indicator
If you're not in Admin mode:
1. Click the colored role badge in the top-right corner
2. A dialog will appear with instructions
3. Click "OK" to switch to Admin mode immediately

## Understanding Roles

### Admin
- **Full access** to everything
- Can see and use the **Admin button**
- Can edit, export, share, and manage all content
- Can switch between roles and modes

### Agent  
- Can edit and export proposals
- **Cannot** access Admin panel
- Can share with clients
- Can switch to presentation mode

### Client
- **View-only** access
- Cannot edit or export
- Cannot access Admin panel
- Minimal UI for clean proposal viewing

## Why Did This Happen?

The role setting is stored in your browser's `localStorage`. If you or someone else previously switched to a different role, it persists even after closing the browser. This is by design so clients can access shared proposals without admin controls visible.

## Resetting Everything

If you want to completely reset the app to defaults:

### Option 1: Clear Specific Settings
```javascript
// In browser console:
localStorage.removeItem('foundry-user-role');
localStorage.removeItem('foundry-view-mode');
window.location.reload();
```

### Option 2: Clear All App Data
```javascript
// In browser console:
Object.keys(localStorage)
  .filter(k => k.startsWith('foundry'))
  .forEach(k => localStorage.removeItem(k));
window.location.reload();
```

### Option 3: Use URL Parameter
Add `?reset=true` to the URL (if maintenance utilities are enabled)

## Troubleshooting

### "Nothing happens when I run commands"
- Make sure you're in the **Console** tab, not Elements or Network
- Check for any red error messages
- Try refreshing the page first, then run the command again

### "Admin button still not showing"
1. Verify your role: Run `window.roleMode.getCurrentRole()` in console
2. If it returns anything other than `"admin"`, run `window.switchToAdmin()`
3. If that doesn't work, manually add `?role=admin` to the URL

### "I want to stay in Admin mode permanently"
- Admin is the default role
- Only switch to other roles when intentionally sharing with clients
- Bookmark the URL with `?role=admin` to always open in admin mode

## For Developers

### Programmatic Role Switching
```javascript
// Switch to admin (bypasses permissions)
window.switchToAdmin();

// Switch role (admin only)
window.roleMode.switchRole('agent');    // or 'client' or 'admin'

// Switch mode (if permitted)
window.roleMode.switchMode('edit');     // or 'presentation'

// Check permissions
window.roleMode.canViewAdmin();         // returns true/false
window.proposalGuard.getCurrentPermissions();  // returns full permissions object
```

### Events
Listen for role/mode changes:
```javascript
window.addEventListener('roleChanged', (e) => {
  console.log('New role:', e.detail.role);
});

window.addEventListener('modeChanged', (e) => {
  console.log('New mode:', e.detail.mode);
});
```

## Need More Help?

- Check browser console for helpful messages
- Look for colored console messages with instructions
- The app automatically logs your current role on page load
- If you see a message about switching to Admin, it means you're not currently in Admin mode
