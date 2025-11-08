/**
 * Leads Management Page
 * Luxury Travel Sweden CMS
 */

let allLeads = [];
let currentFilter = 'all';
let selectedLeadId = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Leads page initializing...');

    // Check authentication
    const isAuthenticated = await checkAuthentication();

    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize site selector
    window.SiteSelector.initializeSiteSelector();

    // Setup event listeners
    setupEventListeners();

    // Load leads
    await loadLeads();

    // Hide loading screen
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'flex';
});

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
 * Setup event listeners
 */
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Export button
    document.getElementById('exportLeads')?.addEventListener('click', exportLeadsToCSV);

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const status = e.target.getAttribute('data-status');
            filterLeads(status);
        });
    });

    // Modal close
    document.getElementById('closeLeadModal')?.addEventListener('click', closeLeadModal);
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

/**
 * Load leads from database
 */
async function loadLeads() {
    try {
        const { data: leads, error } = await window.Supabase.client
            .from('leads')
            .select('*')
            .eq('site', window.CURRENT_SITE || 'henrik')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allLeads = leads || [];

        // Update counts
        updateCounts();

        // Render table
        renderLeadsTable();

    } catch (error) {
        console.error('Error loading leads:', error);
        alert('Failed to load leads. Please refresh the page.');
    }
}

/**
 * Update status counts
 */
function updateCounts() {
    document.getElementById('countAll').textContent = allLeads.length;
    document.getElementById('countNew').textContent = allLeads.filter(l => l.status === 'new').length;
    document.getElementById('countContacted').textContent = allLeads.filter(l => l.status === 'contacted').length;
    document.getElementById('countQualified').textContent = allLeads.filter(l => l.status === 'qualified').length;
    document.getElementById('countConverted').textContent = allLeads.filter(l => l.status === 'converted').length;
}

/**
 * Filter leads by status
 */
function filterLeads(status) {
    currentFilter = status;

    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-status') === status) {
            tab.classList.add('active');
        }
    });

    // Render filtered table
    renderLeadsTable();
}

/**
 * Render leads table
 */
function renderLeadsTable() {
    const container = document.getElementById('leadsTableContainer');

    // Filter leads
    const filteredLeads = currentFilter === 'all'
        ? allLeads
        : allLeads.filter(lead => lead.status === currentFilter);

    if (filteredLeads.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                </svg>
                <h3>No leads yet</h3>
                <p>Leads captured through LIV AI conversations will appear here.</p>
            </div>
        `;
        return;
    }

    // Build table
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredLeads.map(lead => `
                    <tr data-lead-id="${lead.id}">
                        <td><strong>${lead.name || 'Unknown'}</strong></td>
                        <td>${lead.email}</td>
                        <td>${lead.phone || '—'}</td>
                        <td><span class="badge badge-${lead.source}">${formatSource(lead.source)}</span></td>
                        <td><span class="status-badge status-${lead.status}">${formatStatus(lead.status)}</span></td>
                        <td>${formatDate(lead.created_at)}</td>
                        <td>
                            <button class="btn-icon" onclick="viewLead('${lead.id}')" title="View Details">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 5C5 5 2 10 2 10s3 5 8 5 8-5 8-5-3-5-8-5z" stroke="currentColor" stroke-width="1.5"/>
                                    <circle cx="10" cy="10" r="2" fill="currentColor"/>
                                </svg>
                            </button>
                            <button class="btn-icon" onclick="updateLeadStatus('${lead.id}')" title="Update Status">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                    <path d="M3 10l4 4L17 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

/**
 * View lead details
 */
async function viewLead(leadId) {
    selectedLeadId = leadId;

    try {
        // Get lead details
        const { data: lead, error: leadError } = await window.Supabase.client
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single();

        if (leadError) throw leadError;

        // Get conversations
        const { data: conversations, error: convError } = await window.Supabase.client
            .from('conversations')
            .select('*, conversation_messages(*)')
            .eq('lead_id', leadId)
            .order('started_at', { ascending: false });

        if (convError) throw convError;

        // Get booking inquiries
        const { data: inquiries, error: inqError } = await window.Supabase.client
            .from('booking_inquiries')
            .select('*')
            .eq('lead_id', leadId);

        if (inqError) throw inqError;

        // Get storyteller inquiries
        const { data: storytellerInquiries, error: stError } = await window.Supabase.client
            .from('storyteller_inquiries')
            .select('*, stories:selected_storyteller_id(title, slug)')
            .eq('lead_id', leadId);

        if (stError) throw stError;

        // Render detail modal
        renderLeadDetail(lead, conversations || [], inquiries || [], storytellerInquiries || []);

        // Show modal
        document.getElementById('leadModal').style.display = 'flex';

    } catch (error) {
        console.error('Error loading lead details:', error);
        alert('Failed to load lead details.');
    }
}

/**
 * Render lead detail modal
 */
function renderLeadDetail(lead, conversations, inquiries, storytellerInquiries = []) {
    const content = document.getElementById('leadDetailContent');

    const detailHTML = `
        <div class="lead-detail">
            <div class="lead-info-grid">
                <div class="info-section">
                    <h3>Contact Information</h3>
                    <div class="info-row"><strong>Name:</strong> ${lead.name || 'Not provided'}</div>
                    <div class="info-row"><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></div>
                    <div class="info-row"><strong>Phone:</strong> ${lead.phone ? `<a href="tel:${lead.phone}">${lead.phone}</a>` : 'Not provided'}</div>
                    <div class="info-row"><strong>Country:</strong> ${lead.country || 'Not provided'}</div>
                    <div class="info-row"><strong>Source:</strong> ${formatSource(lead.source)}</div>
                    <div class="info-row"><strong>Status:</strong> <span class="status-badge status-${lead.status}">${formatStatus(lead.status)}</span></div>
                    <div class="info-row"><strong>Created:</strong> ${formatDateTime(lead.created_at)}</div>
                </div>

                <div class="info-section">
                    <h3>Notes</h3>
                    <textarea id="leadNotes" rows="5" placeholder="Add notes about this lead...">${lead.notes || ''}</textarea>
                    <button onclick="saveLeadNotes('${lead.id}')" class="btn-primary">Save Notes</button>
                </div>
            </div>

            <div class="info-section">
                <h3>Conversations (${conversations.length})</h3>
                ${conversations.length > 0 ? conversations.map(conv => `
                    <div class="conversation-card">
                        <div class="conversation-header">
                            <strong>Session: ${conv.session_id}</strong>
                            <span>${formatDateTime(conv.started_at)}</span>
                        </div>
                        <div class="conversation-context">
                            ${conv.context ? `Context: ${JSON.stringify(conv.context)}` : 'No context'}
                        </div>
                        <div class="message-count">${conv.message_count} messages</div>
                        <button onclick="viewConversation('${conv.id}')" class="btn-secondary btn-sm">View Messages</button>
                    </div>
                `).join('') : '<p>No conversations yet.</p>'}
            </div>

            <div class="info-section">
                <h3>Booking Inquiries (${inquiries.length})</h3>
                ${inquiries.length > 0 ? inquiries.map(inq => `
                    <div class="inquiry-card">
                        <div class="inquiry-header">
                            <strong>Inquiry #${inq.id.slice(0, 8)}</strong>
                            <span class="status-badge status-${inq.status}">${formatStatus(inq.status)}</span>
                        </div>
                        ${inq.travel_dates_start ? `<div><strong>Dates:</strong> ${formatDate(inq.travel_dates_start)} - ${formatDate(inq.travel_dates_end)}</div>` : ''}
                        ${inq.group_size ? `<div><strong>Group Size:</strong> ${inq.group_size}</div>` : ''}
                        ${inq.budget_range ? `<div><strong>Budget:</strong> ${inq.budget_range}</div>` : ''}
                        ${inq.special_requests ? `<div><strong>Requests:</strong> ${inq.special_requests}</div>` : ''}
                    </div>
                `).join('') : '<p>No booking inquiries yet.</p>'}
            </div>

            <div class="info-section">
                <h3>Storyteller Inquiries (${storytellerInquiries.length})</h3>
                ${storytellerInquiries.length > 0 ? storytellerInquiries.map(inq => `
                    <div class="inquiry-card" style="border-left: 3px solid #eab308;">
                        <div class="inquiry-header">
                            <strong>${inq.stories ? inq.stories.title : inq.storyteller_name || 'Storyteller'}</strong>
                            <span class="status-badge status-${inq.status}">${formatStatus(inq.status)}</span>
                        </div>
                        <div><strong>Topic:</strong> ${formatTopic(inq.topic_of_interest)}</div>
                        <div><strong>Activity:</strong> ${formatActivity(inq.activity_type)}</div>
                        <div><strong>Type:</strong> ${inq.inquiry_type === 'corporate' ? 'Corporate/Group' : 'Private'}</div>
                        ${inq.group_size ? `<div><strong>Group Size:</strong> ${inq.group_size}</div>` : ''}
                        ${inq.preferred_dates ? `<div><strong>Preferred Dates:</strong> ${inq.preferred_dates}</div>` : ''}
                        ${inq.budget_range ? `<div><strong>Budget:</strong> ${inq.budget_range}</div>` : ''}
                        ${inq.special_requests ? `<div><strong>Special Requests:</strong> ${inq.special_requests}</div>` : ''}
                        <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #888;">
                            Created: ${formatDateTime(inq.created_at)}
                        </div>
                    </div>
                `).join('') : '<p>No storyteller inquiries yet.</p>'}
            </div>
        </div>
    `;

    content.innerHTML = detailHTML;
}

/**
 * Close lead modal
 */
function closeLeadModal() {
    document.getElementById('leadModal').style.display = 'none';
    selectedLeadId = null;
}

/**
 * Save lead notes
 */
async function saveLeadNotes(leadId) {
    const notes = document.getElementById('leadNotes').value;

    try {
        const { error } = await window.Supabase.client
            .from('leads')
            .update({ notes })
            .eq('id', leadId)
            .eq('site', window.CURRENT_SITE || 'henrik');

        if (error) throw error;

        alert('Notes saved successfully!');

        // Reload leads
        await loadLeads();

    } catch (error) {
        console.error('Error saving notes:', error);
        alert('Failed to save notes.');
    }
}

/**
 * Update lead status
 */
async function updateLeadStatus(leadId) {
    const lead = allLeads.find(l => l.id === leadId);
    if (!lead) return;

    const statuses = ['new', 'contacted', 'qualified', 'converted', 'closed'];
    const currentIndex = statuses.indexOf(lead.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
        const { error } = await window.Supabase.client
            .from('leads')
            .update({ status: nextStatus })
            .eq('id', leadId)
            .eq('site', window.CURRENT_SITE || 'henrik');

        if (error) throw error;

        // Reload leads
        await loadLeads();

    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status.');
    }
}

/**
 * Export leads to CSV
 */
function exportLeadsToCSV() {
    if (allLeads.length === 0) {
        alert('No leads to export.');
        return;
    }

    // Build CSV
    const headers = ['Name', 'Email', 'Phone', 'Country', 'Source', 'Status', 'Created', 'Notes'];
    const rows = allLeads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.country || '',
        lead.source || '',
        lead.status || '',
        lead.created_at || '',
        lead.notes || ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Format helpers
 */
function formatSource(source) {
    return source?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
}

function formatStatus(status) {
    return status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
}

function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTopic(topic) {
    const topics = {
        'film': 'Film',
        'music': 'Music',
        'performance': 'Performance',
        'fashion': 'Fashion',
        'design': 'Design',
        'art': 'Visual Art',
        'writing': 'Writing',
        'photography': 'Photography',
        'digital_media': 'Digital Media',
        'technology': 'Technology',
        'wellness': 'Wellness'
    };
    return topics[topic] || topic?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
}

function formatActivity(activity) {
    const activities = {
        'meet_and_greet': 'Meet & Greet',
        'workshop': 'Workshop',
        'creative_activity': 'Creative Activity',
        'consultation': 'Consultation',
        'performance': 'Performance',
        'tour': 'Tour'
    };
    return activities[activity] || activity?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
}

// Expose functions globally
window.viewLead = viewLead;
window.updateLeadStatus = updateLeadStatus;
window.saveLeadNotes = saveLeadNotes;
