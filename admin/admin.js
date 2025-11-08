/**
 * Admin Dashboard JavaScript
 * Luxury Travel Sweden CMS
 *
 * This file handles:
 * - Authentication checks
 * - Dashboard data loading
 * - User interface interactions
 * - Navigation
 */

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin dashboard initializing...');

    // Check authentication
    const isAuthenticated = await checkAuthentication();

    if (!isAuthenticated) {
        // Redirect to login page
        window.location.href = 'login.html';
        return;
    }

    // Initialize site selector
    window.SiteSelector.initializeSiteSelector();

    // Load dashboard
    await initializeDashboard();
});

// ==========================================
// AUTHENTICATION
// ==========================================

/**
 * Check if user is authenticated
 */
async function checkAuthentication() {
    try {
        if (!window.Supabase) {
            console.error('Supabase client not loaded');
            return false;
        }

        const isAuth = await window.Supabase.auth.isAuthenticated();

        if (!isAuth) {
            console.log('User not authenticated');
            return false;
        }

        // Get user details and display
        const user = await window.Supabase.auth.getUser();
        displayUserInfo(user);

        return true;
    } catch (error) {
        console.error('Authentication check failed:', error);
        return false;
    }
}

/**
 * Display user information in sidebar
 */
function displayUserInfo(user) {
    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl && user && user.email) {
        userEmailEl.textContent = user.email;
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        await window.Supabase.auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Failed to logout. Please try again.');
    }
}

// ==========================================
// DASHBOARD INITIALIZATION
// ==========================================

/**
 * Initialize the dashboard
 */
async function initializeDashboard() {
    console.log('Loading dashboard data...');

    // Setup event listeners
    setupEventListeners();

    // Load all dashboard data in parallel
    await Promise.all([
        loadStats(),
        loadRecentContent()
    ]);

    // Hide loading screen and show dashboard
    hideLoadingScreen();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Stat card clicks
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            navigateToSection(type);
        });
    });
}

/**
 * Navigate to a specific section
 */
function navigateToSection(type) {
    const routes = {
        'destinations': 'destinations.html',
        'blog': 'posts.html',
        'stories': 'stories.html',
        'media': 'media.html'
    };

    if (routes[type]) {
        window.location.href = routes[type];
    }
}

// ==========================================
// DATA LOADING
// ==========================================

/**
 * Load statistics for all content types
 */
async function loadStats() {
    try {
        // Load data in parallel
        const [destinations, blogPosts, stories, mediaFiles] = await Promise.all([
            loadDestinationsCount(),
            loadBlogPostsCount(),
            loadStoriesCount(),
            loadMediaCount()
        ]);

        // Update UI
        updateStatCard('destinationsCount', destinations);
        updateStatCard('blogPostsCount', blogPosts);
        updateStatCard('storiesCount', stories);
        updateStatCard('mediaCount', mediaFiles);

    } catch (error) {
        console.error('Failed to load stats:', error);
        // Show error state but don't block the dashboard
        showStatsError();
    }
}

/**
 * Load destinations count
 */
async function loadDestinationsCount() {
    try {
        const destinations = await window.Supabase.db.getDestinations(true); // Include unpublished
        return destinations.length;
    } catch (error) {
        console.error('Failed to load destinations count:', error);
        return 0;
    }
}

/**
 * Load blog posts count
 */
async function loadBlogPostsCount() {
    try {
        const posts = await window.Supabase.db.getBlogPosts(false); // Include drafts
        return posts.length;
    } catch (error) {
        console.error('Failed to load blog posts count:', error);
        return 0;
    }
}

/**
 * Load stories count
 */
async function loadStoriesCount() {
    try {
        const stories = await window.Supabase.db.getStories(false); // Include unpublished
        return stories.length;
    } catch (error) {
        console.error('Failed to load stories count:', error);
        return 0;
    }
}

/**
 * Load media files count
 */
async function loadMediaCount() {
    try {
        const media = await window.Supabase.storage.getMediaFiles();
        return media.length;
    } catch (error) {
        console.error('Failed to load media count:', error);
        return 0;
    }
}

/**
 * Update a stat card with a value
 */
function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = value.toLocaleString();
    }
}

/**
 * Show error state for stats
 */
function showStatsError() {
    ['destinationsCount', 'blogPostsCount', 'storiesCount', 'mediaCount'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '<span style="color: var(--admin-danger);">Error</span>';
        }
    });
}

// ==========================================
// RECENT CONTENT LOADING
// ==========================================

/**
 * Load recent content
 */
async function loadRecentContent() {
    try {
        await Promise.all([
            loadRecentDestinations(),
            loadRecentBlogPosts()
        ]);
    } catch (error) {
        console.error('Failed to load recent content:', error);
    }
}

/**
 * Load recent destinations
 */
async function loadRecentDestinations() {
    const container = document.getElementById('recentDestinations');
    if (!container) return;

    try {
        const destinations = await window.Supabase.db.getDestinations(true);

        // Sort by created_at and take top 5
        const recent = destinations
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<div class="overview-empty">No destinations yet</div>';
            return;
        }

        // Render items
        container.innerHTML = recent.map(dest => createOverviewItem(
            dest.title,
            dest.published ? 'published' : 'draft',
            formatDate(dest.created_at),
            `destinations.html?edit=${dest.id}`
        )).join('');

    } catch (error) {
        console.error('Failed to load recent destinations:', error);
        container.innerHTML = '<div class="overview-empty text-danger">Failed to load</div>';
    }
}

/**
 * Load recent blog posts
 */
async function loadRecentBlogPosts() {
    const container = document.getElementById('recentBlogPosts');
    if (!container) return;

    try {
        const posts = await window.Supabase.db.getBlogPosts(false);

        // Take top 5
        const recent = posts.slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<div class="overview-empty">No blog posts yet</div>';
            return;
        }

        // Render items
        container.innerHTML = recent.map(post => createOverviewItem(
            post.title,
            post.published_at ? 'published' : 'draft',
            formatDate(post.created_at),
            `posts.html?edit=${post.id}`
        )).join('');

    } catch (error) {
        console.error('Failed to load recent blog posts:', error);
        container.innerHTML = '<div class="overview-empty text-danger">Failed to load</div>';
    }
}

/**
 * Create overview item HTML
 */
function createOverviewItem(title, status, date, url) {
    const statusClass = status === 'published' ? 'status-published' : 'status-draft';
    const statusLabel = status === 'published' ? 'Published' : 'Draft';

    return `
        <div class="overview-item" onclick="window.location.href='${url}'">
            <div class="overview-item-title">${escapeHtml(title)}</div>
            <div class="overview-item-meta">
                <span class="overview-item-status ${statusClass}">
                    <span class="status-dot"></span>
                    ${statusLabel}
                </span>
                <span>${date}</span>
            </div>
        </div>
    `;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Hide loading screen and show dashboard
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const adminApp = document.getElementById('adminApp');

    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }

    if (adminApp) {
        adminApp.style.display = 'flex';
        // Add fade-in animation
        adminApp.classList.add('fade-in');
    }
}

/**
 * Show loading screen
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const adminApp = document.getElementById('adminApp');

    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }

    if (adminApp) {
        adminApp.style.display = 'none';
    }
}

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// ==========================================
// EXPORTS (for use in other admin pages)
// ==========================================

window.AdminDashboard = {
    checkAuthentication,
    handleLogout,
    formatDate,
    escapeHtml,
    showLoadingScreen,
    hideLoadingScreen
};

console.log('Admin dashboard script loaded');
