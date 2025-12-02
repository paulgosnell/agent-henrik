/**
 * Authentication Manager for Luxury Travel Sweden CMS
 *
 * Handles user authentication, session management, and auth state
 *
 * Usage:
 * - requireAuth() - Call on protected pages to enforce authentication
 * - login(email, password, rememberMe) - Login user
 * - logout() - Logout user
 * - checkAuth() - Check if user is authenticated
 * - getUser() - Get current user
 */

(function() {
    'use strict';

    // Detect base path from current location
    function getBasePath() {
        const path = window.location.pathname;
        // Find the admin folder position and get everything before it
        const adminIndex = path.indexOf('/admin/');
        if (adminIndex > 0) {
            return path.substring(0, adminIndex);
        }
        return '';
    }

    const BASE_PATH = getBasePath();

    // Configuration
    const CONFIG = {
        LOGIN_PAGE: BASE_PATH + '/admin/login.html',
        DASHBOARD_PAGE: BASE_PATH + '/admin/index.html',
        SESSION_KEY: 'lts_admin_session',
        REMEMBER_KEY: 'lts_admin_remember',
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
        REMEMBER_TIMEOUT: 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    // Auth state
    let currentUser = null;
    let authStateListeners = [];

    /**
     * Initialize authentication system
     */
    async function init() {
        // Check if Supabase is available
        if (!window.Supabase || !window.Supabase.auth) {
            console.error('Supabase client not available. Make sure supabase-client.js is loaded.');
            return;
        }

        // Listen for auth state changes
        window.Supabase.auth.onAuthStateChange((event, session) => {
            handleAuthStateChange(event, session);
        });

        // Restore session from storage
        await restoreSession();
    }

    /**
     * Handle auth state changes from Supabase
     */
    function handleAuthStateChange(event, session) {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            saveSession(session);
            notifyAuthStateListeners(currentUser);
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            clearSession();
            notifyAuthStateListeners(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
            saveSession(session);
        }
    }

    /**
     * Restore session from localStorage
     */
    async function restoreSession() {
        try {
            const sessionData = localStorage.getItem(CONFIG.SESSION_KEY);
            const rememberMe = localStorage.getItem(CONFIG.REMEMBER_KEY) === 'true';

            if (!sessionData) {
                return null;
            }

            const session = JSON.parse(sessionData);

            // Check if session is expired
            const expiresAt = new Date(session.expires_at);
            const now = new Date();
            const timeout = rememberMe ? CONFIG.REMEMBER_TIMEOUT : CONFIG.SESSION_TIMEOUT;

            if (now - expiresAt > timeout) {
                // Session expired, clear it
                clearSession();
                return null;
            }

            // Try to get current user from Supabase
            const user = await window.Supabase.auth.getUser();

            if (user) {
                currentUser = user;
                return user;
            }

            // If no user, clear session
            clearSession();
            return null;
        } catch (error) {
            console.error('Failed to restore session:', error);
            clearSession();
            return null;
        }
    }

    /**
     * Save session to localStorage
     */
    function saveSession(session) {
        try {
            const sessionData = {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                expires_at: session.expires_at || new Date(Date.now() + CONFIG.SESSION_TIMEOUT).toISOString(),
                user: session.user
            };

            localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(sessionData));
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }

    /**
     * Clear session from localStorage
     */
    function clearSession() {
        try {
            localStorage.removeItem(CONFIG.SESSION_KEY);
            localStorage.removeItem(CONFIG.REMEMBER_KEY);
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }

    /**
     * Login with email and password
     */
    async function login(email, password, rememberMe = false) {
        try {
            // Validate inputs
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Validate email format
            if (!isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Validate password length
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Attempt sign in
            const data = await window.Supabase.auth.signIn(email, password);

            // Save remember me preference
            if (rememberMe) {
                localStorage.setItem(CONFIG.REMEMBER_KEY, 'true');
            } else {
                localStorage.removeItem(CONFIG.REMEMBER_KEY);
            }

            // Save session
            if (data.session) {
                saveSession(data.session);
            }

            currentUser = data.user;

            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout current user
     */
    async function logout() {
        try {
            // Sign out from Supabase
            await window.Supabase.auth.signOut();

            // Clear local session
            currentUser = null;
            clearSession();

            // Redirect to login page
            window.location.href = CONFIG.LOGIN_PAGE;
        } catch (error) {
            console.error('Logout error:', error);

            // Even if signout fails, clear local state and redirect
            currentUser = null;
            clearSession();
            window.location.href = CONFIG.LOGIN_PAGE;
        }
    }

    /**
     * Check if user is authenticated
     */
    async function checkAuth() {
        try {
            // If we have current user, return it
            if (currentUser) {
                return currentUser;
            }

            // Try to get user from Supabase
            const user = await window.Supabase.auth.getUser();

            if (user) {
                currentUser = user;
                return user;
            }

            // Try to restore from session
            return await restoreSession();
        } catch (error) {
            console.error('Check auth error:', error);
            return null;
        }
    }

    /**
     * Get current user
     */
    function getUser() {
        return currentUser;
    }

    /**
     * Require authentication - redirect to login if not authenticated
     * Call this on protected pages
     */
    async function requireAuth() {
        // Show loading state
        showLoadingScreen();

        try {
            const user = await checkAuth();

            if (!user) {
                // Not authenticated, redirect to login
                redirectToLogin();
                return null;
            }

            // User is authenticated
            hideLoadingScreen();
            return user;
        } catch (error) {
            console.error('Auth check failed:', error);
            redirectToLogin();
            return null;
        }
    }

    /**
     * Reset password
     */
    async function resetPassword(email) {
        try {
            if (!email || !isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Send password reset email
            const { error } = await window.Supabase.client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}${BASE_PATH}/admin/reset-password.html`
            });

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    /**
     * Update password (for logged-in users)
     */
    async function updatePassword(newPassword) {
        try {
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            if (newPassword.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const { error } = await window.Supabase.client.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Update password error:', error);
            throw error;
        }
    }

    /**
     * Listen for auth state changes
     */
    function onAuthStateChange(callback) {
        authStateListeners.push(callback);

        // Return unsubscribe function
        return () => {
            authStateListeners = authStateListeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all auth state listeners
     */
    function notifyAuthStateListeners(user) {
        authStateListeners.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('Auth state listener error:', error);
            }
        });
    }

    /**
     * Redirect to login page
     */
    function redirectToLogin() {
        const currentPath = window.location.pathname;
        const loginPath = CONFIG.LOGIN_PAGE;

        // Don't redirect if already on login page
        if (currentPath.includes('login.html')) {
            return;
        }

        // Save intended destination
        sessionStorage.setItem('lts_redirect_after_login', currentPath);

        // Redirect to login
        window.location.href = loginPath;
    }

    /**
     * Get redirect URL after login
     */
    function getRedirectAfterLogin() {
        const redirect = sessionStorage.getItem('lts_redirect_after_login');
        sessionStorage.removeItem('lts_redirect_after_login');
        return redirect || CONFIG.DASHBOARD_PAGE;
    }

    /**
     * Show loading screen
     */
    function showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    /**
     * Hide loading screen
     */
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }

        const adminApp = document.getElementById('adminApp');
        if (adminApp) {
            adminApp.style.display = 'flex';
        }
    }

    /**
     * Validate email format
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Setup logout button
     */
    function setupLogoutButton() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                // Confirm logout
                if (confirm('Are you sure you want to logout?')) {
                    await logout();
                }
            });
        }
    }

    /**
     * Update user info in UI
     */
    async function updateUserInfoUI() {
        const user = await checkAuth();
        if (!user) return;

        // Update user email display
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl && user.email) {
            userEmailEl.textContent = user.email;
        }

        // Update user name display
        const userNameEl = document.querySelector('.user-name');
        if (userNameEl && user.user_metadata?.name) {
            userNameEl.textContent = user.user_metadata.name;
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            setupLogoutButton();
        });
    } else {
        init();
        setupLogoutButton();
    }

    // Export public API
    window.AuthManager = {
        // Core auth functions
        requireAuth,
        checkAuth,
        login,
        logout,
        getUser,

        // Password functions
        resetPassword,
        updatePassword,

        // Event listeners
        onAuthStateChange,

        // Utility functions
        getRedirectAfterLogin,
        updateUserInfoUI,

        // For debugging
        _getCurrentUser: () => currentUser,
        _clearSession: clearSession
    };

})();
