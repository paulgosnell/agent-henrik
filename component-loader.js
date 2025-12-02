/**
 * Component Loader for Luxury Travel Sweden
 *
 * Loads shared HTML components (header, footer) into pages
 * ensuring consistent UI across the entire site.
 *
 * Usage: Add placeholders in HTML:
 *   <div id="header-placeholder"></div>
 *   <div id="footer-placeholder"></div>
 */

(function() {
    'use strict';

    // Get base path from the script's own src attribute
    function getBasePath() {
        const scripts = document.querySelectorAll('script[src*="component-loader"]');
        if (scripts.length > 0) {
            const src = scripts[scripts.length - 1].src;
            // Get the directory containing the script
            return src.substring(0, src.lastIndexOf('/') + 1);
        }
        // Fallback: use current page's directory
        return '';
    }

    const BASE_PATH = getBasePath();

    const COMPONENTS = {
        header: {
            url: BASE_PATH + 'components/header.html?v=' + Date.now(),
            placeholder: '#header-placeholder'
        },
        footer: {
            url: BASE_PATH + 'components/footer.html?v=' + Date.now(),
            placeholder: '#footer-placeholder'
        }
    };

    /**
     * Load a component from a URL and inject it into a placeholder
     */
    async function loadComponent(name, config) {
        try {
            const placeholder = document.querySelector(config.placeholder);

            if (!placeholder) {
                console.warn(`Component placeholder not found: ${config.placeholder}`);
                return false;
            }

            // Fetch component HTML
            const response = await fetch(config.url);

            if (!response.ok) {
                throw new Error(`Failed to load ${name}: ${response.status} ${response.statusText}`);
            }

            const html = await response.text();

            // Inject HTML into placeholder
            placeholder.outerHTML = html;

            console.log(`✅ Component loaded: ${name}`);

            // Dispatch custom event for other scripts to hook into
            document.dispatchEvent(new CustomEvent(`component-loaded:${name}`, {
                detail: { name, placeholder: config.placeholder }
            }));

            return true;

        } catch (error) {
            console.error(`❌ Error loading component ${name}:`, error);
            return false;
        }
    }

    /**
     * Load all components
     */
    async function loadAllComponents() {
        console.log('🔄 Loading shared components...');

        const loadPromises = Object.entries(COMPONENTS).map(([name, config]) =>
            loadComponent(name, config)
        );

        const results = await Promise.all(loadPromises);
        const allLoaded = results.every(result => result === true);

        if (allLoaded) {
            console.log('✅ All components loaded successfully');

            // Dispatch event when all components are ready
            document.dispatchEvent(new CustomEvent('components-loaded', {
                detail: { components: Object.keys(COMPONENTS) }
            }));

            // Re-initialize Lucide icons for newly loaded components
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        } else {
            console.warn('⚠️ Some components failed to load');
        }
    }

    /**
     * Initialize component loader
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadAllComponents);
        } else {
            loadAllComponents();
        }
    }

    // Start loading components
    init();

    // Export for use by other scripts
    window.ComponentLoader = {
        reload: loadAllComponents,
        loadComponent,
        components: COMPONENTS
    };

})();
