// Team Members Management
let teamMembers = [];
let currentMemberId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadTeamMembers();

  // Setup status filter
  document.getElementById('statusFilter')?.addEventListener('change', () => {
    renderMembersTable();
  });

  // Setup form submit handler
  document.getElementById('memberForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveMember(e);
  });
});

// Load team members from database
async function loadTeamMembers() {
  try {
    showLoading(true);

    const { data, error } = await window.Supabase.client
      .from('team_members')
      .select('*')
      .eq('site', window.CURRENT_SITE || 'sweden')
      .order('display_order', { ascending: true });

    if (error) throw error;

    teamMembers = data || [];
    renderMembersTable();

  } catch (error) {
    console.error('Error loading team members:', error);
    showAlert('Failed to load team members', 'error');
  } finally {
    showLoading(false);
  }
}

// Render team members table
function renderMembersTable() {
  const tbody = document.getElementById('membersTableBody');
  const emptyState = document.getElementById('emptyState');
  const tableContainer = document.getElementById('tableContainer');
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';

  if (!tbody) return;

  // Filter items
  let filteredMembers = teamMembers;
  if (statusFilter === 'published') {
    filteredMembers = teamMembers.filter(member => member.is_published);
  } else if (statusFilter === 'draft') {
    filteredMembers = teamMembers.filter(member => !member.is_published);
  }

  // Show empty state or table
  if (filteredMembers.length === 0) {
    emptyState?.classList.remove('hidden');
    tableContainer?.classList.add('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  tableContainer?.classList.remove('hidden');

  // Render rows
  tbody.innerHTML = filteredMembers.map(member => {
    const isPublished = member.is_published;
    const statusBadge = isPublished
      ? '<span class="badge badge-success">Published</span>'
      : '<span class="badge badge-draft">Draft</span>';

    const imageHtml = member.image_url
      ? `<img src="${escapeHtml(member.image_url)}" alt="${escapeHtml(member.name)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1);">`
      : `<div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">👤</div>`;

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 1rem;">
            ${imageHtml}
            <div>
              <div style="font-weight: 500; margin-bottom: 0.25rem;">${escapeHtml(member.name)}</div>
              ${member.bio ? `<div style="font-size: 0.875rem; color: rgba(255,255,255,0.6); max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(member.bio)}</div>` : ''}
            </div>
          </div>
        </td>
        <td>${escapeHtml(member.role)}</td>
        <td>${member.display_order !== null ? member.display_order : '-'}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-buttons">
            <button
              class="btn-icon btn-icon-edit"
              onclick="editMember('${member.id}')"
              title="Edit"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M14.5 2.5L17.5 5.5L6 17H3V14L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </button>
            <button
              class="btn-icon btn-icon-delete"
              onclick="openDeleteModal('${member.id}', '${escapeHtml(member.name)}')"
              title="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17M8 5V3H12V5M9 9V15M11 9V15M5 5L6 17H14L15 5H5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Open add modal
function openAddMemberModal() {
  currentMemberId = null;
  document.getElementById('modalTitle').textContent = 'Add Team Member';
  document.getElementById('memberForm').reset();
  document.getElementById('memberId').value = '';
  document.getElementById('displayOrder').value = teamMembers.length;
  document.getElementById('isPublished').checked = false;
  document.getElementById('memberModal').classList.add('active');
}

// Edit team member
function editMember(id) {
  const member = teamMembers.find(m => m.id === id);
  if (!member) return;

  currentMemberId = id;
  document.getElementById('modalTitle').textContent = 'Edit Team Member';
  document.getElementById('memberId').value = id;
  document.getElementById('name').value = member.name || '';
  document.getElementById('role').value = member.role || '';
  document.getElementById('bio').value = member.bio || '';
  document.getElementById('imageUrl').value = member.image_url || '';
  document.getElementById('email').value = member.email || '';
  document.getElementById('linkedinUrl').value = member.linkedin_url || '';
  document.getElementById('displayOrder').value = member.display_order !== null ? member.display_order : 0;
  document.getElementById('isPublished').checked = member.is_published || false;

  document.getElementById('memberModal').classList.add('active');
}

// Save team member
async function saveMember(event) {
  event.preventDefault();

  const form = document.getElementById('memberForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = {
    name: document.getElementById('name').value.trim(),
    role: document.getElementById('role').value.trim(),
    bio: document.getElementById('bio').value.trim() || null,
    image_url: document.getElementById('imageUrl').value.trim() || null,
    email: document.getElementById('email').value.trim() || null,
    linkedin_url: document.getElementById('linkedinUrl').value.trim() || null,
    display_order: parseInt(document.getElementById('displayOrder').value) || 0,
    is_published: document.getElementById('isPublished').checked,
    site: window.CURRENT_SITE || 'sweden'
  };

  try {
    const saveBtn = document.getElementById('saveBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    const originalText = saveBtnText.textContent;

    saveBtn.disabled = true;
    saveBtnText.textContent = 'Saving...';

    let result;

    if (currentMemberId) {
      // Update existing
      result = await window.Supabase.client
        .from('team_members')
        .update(formData)
        .eq('id', currentMemberId)
        .eq('site', window.CURRENT_SITE || 'sweden')
        .select()
        .single();
    } else {
      // Create new
      result = await window.Supabase.client
        .from('team_members')
        .insert([formData])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    showAlert(
      currentMemberId ? 'Team member updated successfully' : 'Team member created successfully',
      'success'
    );

    closeMemberModal();
    await loadTeamMembers();

  } catch (error) {
    console.error('Error saving team member:', error);
    showAlert('Failed to save team member: ' + error.message, 'error');
  } finally {
    const saveBtn = document.getElementById('saveBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    saveBtn.disabled = false;
    saveBtnText.textContent = 'Save';
  }
}

// Close member modal
function closeMemberModal() {
  document.getElementById('memberModal').classList.remove('active');
  currentMemberId = null;
}

// Open delete confirmation modal
function openDeleteModal(id, name) {
  currentMemberId = id;
  document.getElementById('deleteMemberName').textContent = name;
  document.getElementById('deleteModal').classList.add('active');
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  currentMemberId = null;
}

// Confirm delete
async function confirmDelete() {
  if (!currentMemberId) return;

  try {
    const { error } = await window.Supabase.client
      .from('team_members')
      .delete()
      .eq('id', currentMemberId)
      .eq('site', window.CURRENT_SITE || 'sweden');

    if (error) throw error;

    showAlert('Team member deleted successfully', 'success');
    closeDeleteModal();
    await loadTeamMembers();

  } catch (error) {
    console.error('Error deleting team member:', error);
    showAlert('Failed to delete team member: ' + error.message, 'error');
  }
}

// Show loading state
function showLoading(isLoading) {
  const loadingState = document.getElementById('loadingState');
  const tableContainer = document.getElementById('tableContainer');
  const emptyState = document.getElementById('emptyState');

  if (isLoading) {
    loadingState?.classList.remove('hidden');
    tableContainer?.classList.add('hidden');
    emptyState?.classList.add('hidden');
  } else {
    loadingState?.classList.add('hidden');
  }
}

// Show alert message
function showAlert(message, type = 'info') {
  const container = document.getElementById('alertContainer');
  if (!container) return;

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: inherit; cursor: pointer; font-size: 1.25rem; line-height: 1;">&times;</button>
  `;

  container.appendChild(alert);

  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Close modals on outside click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    if (e.target.id === 'memberModal') closeMemberModal();
    if (e.target.id === 'deleteModal') closeDeleteModal();
  }
});

// Close modals on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMemberModal();
    closeDeleteModal();
  }
});
