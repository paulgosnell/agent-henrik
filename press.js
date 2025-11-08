/**
 * Press Page JavaScript
 * Loads and renders press items from Supabase for Agent Henrik
 */

// Wait for DOM and Supabase client to be ready
async function waitForSupabase() {
    let attempts = 0;
    const maxAttempts = 50;

    while (!window.Supabase?.client && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!window.Supabase?.client) {
        throw new Error('Supabase client not available');
    }

    return window.Supabase.client;
}

// Load press items from Supabase
async function loadPressItems() {
    const grid = document.getElementById('pressGrid');
    if (!grid) return;

    try {
        // Wait for Supabase client to be ready
        const supabaseClient = await waitForSupabase();

        // Fetch press items for Henrik site
        const { data: pressItems, error } = await supabaseClient
            .from('press_items')
            .select('*')
            .eq('site', 'henrik')
            .not('published_at', 'is', null)
            .order('published_at', { ascending: false });

        if (error) {
            console.error('Error loading press:', error);
            grid.innerHTML = '<div class="press-loading"><p>Unable to load press coverage. Please try again later.</p></div>';
            return;
        }

        if (!pressItems || pressItems.length === 0) {
            grid.innerHTML = '<div class="press-loading"><p>No press coverage available yet.</p></div>';
            return;
        }

        // Render press grid
        renderPressGrid(pressItems);

    } catch (error) {
        console.error('Error loading press items:', error);
        grid.innerHTML = '<div class="press-loading"><p>Unable to load press coverage. Please try again later.</p></div>';
    }
}

// Render press grid
function renderPressGrid(items) {
    const grid = document.getElementById('pressGrid');
    if (!grid) return;

    grid.innerHTML = items.map(item => {
        const imageUrl = item.thumbnail_url || item.image_url || '/images/press/placeholder.jpg';
        const linkUrl = item.pdf_url || item.link_url;
        const hasLink = linkUrl && linkUrl.trim() !== '';

        return `
            <article class="press-card" data-press-id="${item.id}">
                <div class="press-thumbnail">
                    <img src="${imageUrl}" alt="${escapeHtml(item.title)}" loading="lazy">
                </div>
                <div class="press-content">
                    <p class="press-source">${escapeHtml(item.source)}</p>
                    <h3 class="press-title">${escapeHtml(item.title)}</h3>
                    ${item.excerpt ? `<p class="press-excerpt">${escapeHtml(item.excerpt)}</p>` : ''}
                    <p class="press-date">${formatDate(item.published_at)}</p>
                    ${hasLink ? `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="press-read-link">Read Article →</a>` : ''}
                </div>
            </article>
        `;
    }).join('');
}

// Format date to human-readable format
function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPressItems);
} else {
    loadPressItems();
}
