/**
 * Site Selector Utility
 * Multi-Site CMS for Sweden & Agent Henrik
 *
 * Provides site selection UI and utilities for filtering queries
 */

// ==========================================
// CONSTANTS
// ==========================================

const STORAGE_KEY = 'lts_cms_selected_site';
const DEFAULT_SITE = 'henrik'; // Default to Agent Henrik

const SITE_CONFIG = {
  sweden: {
    name: 'Luxury Travel Sweden',
    code: 'sweden',
    color: '#3b82f6',
    domain: 'luxurytravelsweden.com'
  },
  henrik: {
    name: 'Agent Henrik',
    code: 'henrik',
    color: '#10b981',
    domain: 'agenthhenrik.com'
  }
};

// ==========================================
// CORE FUNCTIONS
// ==========================================

/**
 * Get currently selected site
 * @returns {string} 'sweden' or 'henrik'
 */
function getSelectedSite() {
  const stored = localStorage.getItem(STORAGE_KEY);

  // Validate stored value
  if (stored && (stored === 'sweden' || stored === 'henrik')) {
    return stored;
  }

  // Return default if invalid or not set
  return DEFAULT_SITE;
}

/**
 * Set selected site
 * @param {string} site - 'sweden' or 'henrik'
 */
function setSelectedSite(site) {
  if (site !== 'sweden' && site !== 'henrik') {
    console.error('Invalid site:', site);
    return;
  }

  localStorage.setItem(STORAGE_KEY, site);

  // Dispatch custom event so other components can react
  window.dispatchEvent(new CustomEvent('siteChanged', {
    detail: { site, config: SITE_CONFIG[site] }
  }));
}

/**
 * Get site configuration
 * @param {string} site - Optional site code, uses selected site if not provided
 * @returns {object} Site configuration object
 */
function getSiteConfig(site = null) {
  const siteCode = site || getSelectedSite();
  return SITE_CONFIG[siteCode];
}

// ==========================================
// UI INITIALIZATION
// ==========================================

/**
 * Initialize site selector UI
 * Call this on DOMContentLoaded in each admin page
 */
function initializeSiteSelector() {
  const container = document.getElementById('siteSelectorContainer');

  if (!container) {
    console.warn('Site selector container not found');
    return;
  }

  const currentSite = getSelectedSite();
  const currentConfig = getSiteConfig(currentSite);

  // Build the UI
  container.innerHTML = `
    <div class="site-selector">
      <label class="site-selector-label">Managing Site:</label>
      <div class="site-selector-dropdown">
        <button class="site-selector-btn" id="siteSelectorBtn" aria-haspopup="true" aria-expanded="false">
          <span class="site-indicator" style="background-color: ${currentConfig.color}"></span>
          <span class="site-name">${currentConfig.name}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="chevron">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="site-selector-menu" id="siteSelectorMenu" style="display: none;">
          ${Object.entries(SITE_CONFIG).map(([code, config]) => `
            <button
              class="site-option ${code === currentSite ? 'active' : ''}"
              data-site="${code}"
              ${code === currentSite ? 'disabled' : ''}
            >
              <span class="site-indicator" style="background-color: ${config.color}"></span>
              <div class="site-details">
                <div class="site-name">${config.name}</div>
                <div class="site-domain">${config.domain}</div>
              </div>
              ${code === currentSite ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6 11L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Setup event listeners
  setupSelectorEventListeners();

  // Update page title
  updatePageTitle(currentConfig);
}

/**
 * Setup event listeners for site selector
 */
function setupSelectorEventListeners() {
  const btn = document.getElementById('siteSelectorBtn');
  const menu = document.getElementById('siteSelectorMenu');

  if (!btn || !menu) return;

  // Toggle dropdown
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? 'none' : 'block';
    btn.setAttribute('aria-expanded', !isOpen);
  });

  // Close on outside click
  document.addEventListener('click', () => {
    menu.style.display = 'none';
    btn.setAttribute('aria-expanded', 'false');
  });

  // Handle site selection
  menu.querySelectorAll('.site-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const site = option.dataset.site;

      if (site && site !== getSelectedSite()) {
        // Set new site
        setSelectedSite(site);

        // Reload page to apply new filter
        window.location.reload();
      }
    });
  });
}

/**
 * Update page title with current site
 */
function updatePageTitle(config) {
  const pageTitle = document.querySelector('.page-header h1');
  if (pageTitle) {
    const badge = document.createElement('span');
    badge.className = 'site-badge';
    badge.style.cssText = `
      display: inline-block;
      padding: 0.25rem 0.75rem;
      margin-left: 1rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: ${config.color}20;
      color: ${config.color};
      vertical-align: middle;
    `;
    badge.textContent = config.name;

    // Remove existing badge if any
    const existingBadge = pageTitle.querySelector('.site-badge');
    if (existingBadge) {
      existingBadge.remove();
    }

    pageTitle.appendChild(badge);
  }
}

// ==========================================
// HELPER FOR SUPABASE QUERIES
// ==========================================

/**
 * Add site filter to Supabase query builder
 * Usage: addSiteFilter(supabase.from('destinations').select('*'))
 *
 * @param {object} queryBuilder - Supabase query builder
 * @returns {object} Query builder with site filter added
 */
function addSiteFilter(queryBuilder) {
  const site = getSelectedSite();
  return queryBuilder.eq('site', site);
}

// ==========================================
// EXPORT TO GLOBAL SCOPE
// ==========================================

window.SiteSelector = {
  getSelectedSite,
  setSelectedSite,
  getSiteConfig,
  initializeSiteSelector,
  addSiteFilter
};
