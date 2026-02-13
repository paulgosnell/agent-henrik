/**
 * Simple, reliable menu initialization
 * Runs after components are loaded
 */

// Track if menu has been initialized to prevent duplicate event listeners
let menuInitialized = false;

function initializeMenu() {
    console.log('🔄 Initializing menu...');

    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (!mobileToggle || !navMenu) {
        console.warn('Menu elements not found, retrying...');
        setTimeout(initializeMenu, 100);
        return;
    }

    // Prevent duplicate initialization
    if (menuInitialized) {
        console.log('⏭️  Menu already initialized, skipping...');
        return;
    }

    console.log('✅ Menu elements found');

    // Toggle menu function
    function toggleMenu() {
        const isOpen = navMenu.classList.contains('open');

        if (isOpen) {
            // Close menu
            navMenu.classList.remove('open');
            mobileToggle.classList.remove('is-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
            mobileToggle.setAttribute('aria-label', 'Open menu');
            mobileToggle.textContent = 'MENU';
            document.body.classList.remove('nav-open');
        } else {
            // Open menu
            navMenu.classList.add('open');
            mobileToggle.classList.add('is-open');
            mobileToggle.setAttribute('aria-expanded', 'true');
            mobileToggle.setAttribute('aria-label', 'Close menu');
            mobileToggle.textContent = 'CLOSE';
            document.body.classList.add('nav-open');
        }

        console.log('Menu toggled:', isOpen ? 'closed' : 'opened');
    }

    // Close menu function
    function closeMenu() {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.setAttribute('aria-label', 'Open menu');
        mobileToggle.textContent = 'MENU';
        document.body.classList.remove('nav-open');
    }

    // Attach click handler to button
    mobileToggle.addEventListener('click', toggleMenu);
    console.log('✅ Click handler attached to menu button');

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    console.log('✅ Close handlers attached to nav links');

    // Close menu on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navMenu.classList.contains('open')) {
            closeMenu();
        }
    });
    console.log('✅ Escape key handler attached');

    // Smooth scroll for homepage links
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        const hashLinks = document.querySelectorAll('a[href^="/#"]');
        hashLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                const href = link.getAttribute('href');
                const hash = href.substring(2); // Remove "/#"
                const targetElement = document.getElementById(hash);

                if (targetElement) {
                    event.preventDefault();
                    closeMenu(); // Close menu if open
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.pushState(null, null, '#' + hash);
                }
            });
        });
        console.log('✅ Smooth scroll initialized for homepage links');
    }

    console.log('✅✅✅ Menu initialization complete!');

    // Mark as initialized to prevent duplicate event listeners
    menuInitialized = true;
}

// Try to initialize immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeMenu, 200);
    });
} else {
    setTimeout(initializeMenu, 200);
}

// Also listen for components-loaded event
document.addEventListener('components-loaded', function() {
    console.log('📢 components-loaded event received');
    setTimeout(initializeMenu, 100);
});
