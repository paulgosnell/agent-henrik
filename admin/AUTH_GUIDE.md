# Admin Authentication System Guide

## Overview

The Luxury Travel Sweden CMS now has a complete authentication system built on Supabase Auth. This guide explains how to use and maintain the authentication system.

## Files Created

### 1. `/admin/login.html`
The login page with:
- Email and password fields
- Remember me checkbox
- Forgot password functionality
- Professional luxury styling
- Loading states and error handling
- Auto-redirect if already logged in

### 2. `/admin/auth.js`
The authentication module that provides:
- `requireAuth()` - Enforce authentication on protected pages
- `login(email, password, rememberMe)` - Login functionality
- `logout()` - Logout and redirect to login
- `checkAuth()` - Check authentication status
- `getUser()` - Get current user info
- `resetPassword(email)` - Send password reset email
- Session persistence with localStorage
- Automatic session restoration

### 3. `/admin/admin.css` (updated)
Added comprehensive authentication styling:
- Login page layout and styling
- Form elements with focus states
- Loading spinners and animations
- Error/success message styling
- Modal styling for password reset
- Responsive design for all screen sizes
- Elegant background decorations

### 4. `/admin/index.html` (updated)
Added authentication protection:
- Loads auth.js module
- Calls `requireAuth()` on page load
- Updates user info in sidebar
- Redirects to login if not authenticated

## Usage

### Protecting Admin Pages

To add authentication to any admin page, add these scripts before the closing `</body>` tag:

```html
<!-- Scripts -->
<script src="../supabase-client.js"></script>
<script src="auth.js"></script>
<script src="your-page-script.js"></script>

<!-- Auth Protection -->
<script>
    (async function() {
        const user = await window.AuthManager.requireAuth();

        if (user) {
            // User is authenticated
            await window.AuthManager.updateUserInfoUI();

            // Your page initialization code here
            initializePage();
        }
    })();
</script>
```

### Adding Logout Functionality

The logout button is already configured in the sidebar. For custom logout buttons:

```html
<button id="customLogoutBtn" onclick="window.AuthManager.logout()">
    Logout
</button>
```

### Checking Authentication Status

```javascript
// Check if user is logged in
const user = await window.AuthManager.checkAuth();

if (user) {
    console.log('User is logged in:', user.email);
} else {
    console.log('User is not logged in');
}
```

### Getting Current User

```javascript
// Get current user info
const user = window.AuthManager.getUser();

if (user) {
    console.log('Email:', user.email);
    console.log('ID:', user.id);
    console.log('Metadata:', user.user_metadata);
}
```

## Features

### 1. Session Persistence
- Sessions persist across browser refreshes
- "Remember me" extends session to 30 days
- Automatic session restoration on page load

### 2. Security
- Passwords must be at least 6 characters
- Email validation
- Secure token storage in localStorage
- Automatic session expiration

### 3. User Experience
- Loading states during authentication
- Friendly error messages
- Smooth animations and transitions
- Auto-redirect after login
- Loading screen while checking auth

### 4. Password Reset
- Forgot password link on login page
- Modal dialog for password reset
- Email validation
- Success/error feedback

## Configuration

The authentication system can be configured by modifying constants in `/admin/auth.js`:

```javascript
const CONFIG = {
    LOGIN_PAGE: '/admin/login.html',
    DASHBOARD_PAGE: '/admin/index.html',
    SESSION_KEY: 'lts_admin_session',
    REMEMBER_KEY: 'lts_admin_remember',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    REMEMBER_TIMEOUT: 30 * 24 * 60 * 60 * 1000 // 30 days
};
```

## Supabase Setup

Before the authentication system works, you need to:

1. Configure Supabase credentials in `/supabase-client.js`:
   ```javascript
   const SUPABASE_URL = 'your-project-url';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

2. Create admin users in Supabase:
   - Go to Authentication > Users in Supabase Dashboard
   - Click "Invite User" or "Add User"
   - Enter email and temporary password
   - User will receive confirmation email

3. (Optional) Set up Row Level Security (RLS) policies to restrict data access to authenticated users only

## Testing

### Test the Login Flow

1. Navigate to `/admin/login.html`
2. Enter valid credentials
3. Should redirect to `/admin/index.html`
4. User email should appear in sidebar
5. Logout button should work

### Test Authentication Protection

1. Clear browser storage (localStorage)
2. Try to access `/admin/index.html` directly
3. Should redirect to `/admin/login.html`
4. After login, should return to dashboard

### Test Session Persistence

1. Login with "Remember me" checked
2. Close browser
3. Reopen and navigate to `/admin/`
4. Should remain logged in

### Test Password Reset

1. Click "Forgot password?" on login page
2. Enter email address
3. Click "Send reset link"
4. Check email for reset instructions

## Error Handling

The system handles common errors:
- Invalid credentials
- Network errors
- Session expiration
- Missing Supabase configuration
- Email not confirmed

Error messages are user-friendly and displayed inline on the login form.

## Customization

### Changing Colors/Styling

Edit CSS variables in `/admin/admin.css`:
```css
:root {
    --admin-accent: #4a9eff; /* Primary accent color */
    --admin-success: #3dd68c; /* Success messages */
    --admin-danger: #ff6b6b;  /* Error messages */
    /* ... more variables ... */
}
```

### Customizing Error Messages

Edit the `getErrorMessage()` function in `/admin/login.html`:
```javascript
function getErrorMessage(error) {
    if (error.message.includes('Invalid login credentials')) {
        return 'Your custom message here';
    }
    // ... more conditions
}
```

## Troubleshooting

### Issue: "Supabase client not available"
**Solution:** Make sure `supabase-client.js` is loaded before `auth.js`

### Issue: Redirects to login immediately after successful login
**Solution:** Check browser console for errors. Verify Supabase credentials are correct.

### Issue: "Auth session missing" error
**Solution:** This is normal when not logged in. The auth system handles it gracefully.

### Issue: User can't login with valid credentials
**Solution:**
1. Check if user's email is confirmed in Supabase
2. Verify Supabase URL and anon key are correct
3. Check network tab for API errors

## Security Best Practices

1. **Never commit Supabase credentials** to version control
2. **Use environment variables** for production deployment
3. **Enable email confirmation** in Supabase Auth settings
4. **Set up RLS policies** to restrict data access
5. **Use HTTPS** in production
6. **Regularly rotate** API keys
7. **Monitor** authentication logs in Supabase dashboard

## API Reference

### `window.AuthManager`

#### `requireAuth(): Promise<User|null>`
Checks if user is authenticated. If not, redirects to login page.

#### `login(email: string, password: string, rememberMe: boolean): Promise<User>`
Attempts to login user with email and password.

#### `logout(): Promise<void>`
Logs out current user and redirects to login page.

#### `checkAuth(): Promise<User|null>`
Checks authentication status without redirecting.

#### `getUser(): User|null`
Returns currently logged in user (synchronous).

#### `resetPassword(email: string): Promise<boolean>`
Sends password reset email to user.

#### `updatePassword(newPassword: string): Promise<boolean>`
Updates password for logged in user.

#### `onAuthStateChange(callback: Function): Function`
Listen for auth state changes. Returns unsubscribe function.

#### `updateUserInfoUI(): Promise<void>`
Updates user email in sidebar UI.

## Support

For issues or questions:
1. Check the Supabase documentation: https://supabase.com/docs/guides/auth
2. Review the code comments in `auth.js`
3. Check browser console for detailed error messages
4. Verify Supabase configuration and user setup

## Future Enhancements

Potential improvements to consider:
- Multi-factor authentication (MFA)
- Social login (Google, GitHub, etc.)
- Role-based access control (RBAC)
- Activity logging
- Session management dashboard
- Password strength requirements
- Login attempt rate limiting
- Account lockout after failed attempts

---

**Version:** 1.0.0
**Last Updated:** October 2024
**Maintainer:** Luxury Travel Sweden Development Team
