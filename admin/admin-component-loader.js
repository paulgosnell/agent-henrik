/**
 * Admin Component Loader
 * Loads shared components (sidebar) into admin pages
 */

(function() {
  'use strict';

  /**
   * Load and insert the admin sidebar component
   */
  async function loadSidebar() {
    const placeholder = document.getElementById('sidebar-placeholder');
    if (!placeholder) {
      console.warn('Sidebar placeholder not found');
      return;
    }

    try {
      // Use absolute path to ensure it works regardless of base href
      const response = await fetch('/admin/components/admin-sidebar.html?v=2');
      if (!response.ok) {
        throw new Error(`Failed to load sidebar: ${response.status}`);
      }

      const html = await response.text();
      placeholder.innerHTML = html;

      // Set active nav item based on current page
      setActiveNavItem();

      // Initialize sidebar interactions
      initializeSidebar();

    } catch (error) {
      console.error('Error loading sidebar:', error);
      placeholder.innerHTML = '<p style="color: red; padding: 1rem;">Failed to load sidebar</p>';
    }
  }

  /**
   * Set the active navigation item based on current page
   */
  function setActiveNavItem() {
    // Get current page filename
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '') || 'index';

    // Find and activate the matching nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const itemPage = item.getAttribute('data-page');
      if (itemPage === pageName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Initialize sidebar interactions (logout button, etc.)
   */
  function initializeSidebar() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    // Display user email if available
    displayUserInfo();
  }

  /**
   * Display user information in sidebar
   */
  function displayUserInfo() {
    const userEmailEl = document.getElementById('userEmail');
    if (!userEmailEl) return;

    // Get user from session/localStorage
    const userEmail = localStorage.getItem('adminEmail') ||
                     sessionStorage.getItem('userEmail');

    if (userEmail) {
      userEmailEl.textContent = userEmail;
    } else {
      userEmailEl.textContent = 'Not logged in';
    }
  }

  /**
   * Handle logout
   */
  function handleLogout() {
    // Clear session data
    localStorage.removeItem('adminEmail');
    sessionStorage.clear();

    // Redirect to login
    window.location.href = 'login.html';
  }

  // Load sidebar when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSidebar);
  } else {
    loadSidebar();
  }

})();
