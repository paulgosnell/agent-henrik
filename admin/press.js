// Press & Media Management
let pressItems = [];
let currentPressId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize site selector
  window.SiteSelector.initializeSiteSelector();

  await loadPressItems();

  // Setup status filter
  document.getElementById('statusFilter')?.addEventListener('change', () => {
    renderPressTable();
  });

  // Setup form submit handler
  document.getElementById('pressForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    savePressItem(e, false);
  });
});

// Load press items from database
async function loadPressItems() {
  try {
    showLoading(true);

    const { data, error } = await window.Supabase.client
      .from('press_items')
      .eq('site', window.SiteSelector.getSelectedSite())
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    pressItems = data || [];
    renderPressTable();

  } catch (error) {
    console.error('Error loading press items:', error);
    showAlert('Failed to load press items', 'error');
  } finally {
    showLoading(false);
  }
}

// Render press items table
function renderPressTable() {
  const tbody = document.getElementById('pressTableBody');
  const emptyState = document.getElementById('emptyState');
  const tableContainer = document.getElementById('tableContainer');
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';

  if (!tbody) return;

  // Filter items
  let filteredItems = pressItems;
  if (statusFilter === 'published') {
    filteredItems = pressItems.filter(item => item.published_at);
  } else if (statusFilter === 'draft') {
    filteredItems = pressItems.filter(item => !item.published_at);
  }

  // Show empty state or table
  if (filteredItems.length === 0) {
    emptyState?.classList.remove('hidden');
    tableContainer?.classList.add('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  tableContainer?.classList.remove('hidden');

  // Render rows
  tbody.innerHTML = filteredItems.map(item => {
    const isPublished = item.published_at !== null;
    const statusBadge = isPublished
      ? '<span class="badge badge-success">Published</span>'
      : '<span class="badge badge-draft">Draft</span>';

    const linkTypeLabel = item.link_type === 'pdf' ? 'PDF' : 'External';

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img
              src="${escapeHtml(item.image_url)}"
              alt="${escapeHtml(item.title)}"
              style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);"
            >
            <div>
              <div style="font-weight: 500; margin-bottom: 0.25rem;">${escapeHtml(item.title)}</div>
              ${item.description ? `<div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">${escapeHtml(item.description)}</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <span class="badge badge-${item.link_type === 'pdf' ? 'warning' : 'info'}">${linkTypeLabel}</span>
        </td>
        <td>${item.display_order}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-buttons">
            <button
              class="btn-icon btn-icon-edit"
              onclick="editPressItem('${item.id}')"
              title="Edit"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M14.5 2.5L17.5 5.5L6 17H3V14L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </button>
            <button
              class="btn-icon btn-icon-delete"
              onclick="openDeleteModal('${item.id}', '${escapeHtml(item.title)}')"
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
function openAddPressModal() {
  currentPressId = null;
  document.getElementById('modalTitle').textContent = 'Add Press Item';
  document.getElementById('pressForm').reset();
  document.getElementById('pressId').value = '';
  document.getElementById('displayOrder').value = pressItems.length;
  document.getElementById('pressModal').classList.add('active');
}

// Edit press item
function editPressItem(id) {
  const item = pressItems.find(p => p.id === id);
  if (!item) return;

  currentPressId = id;
  document.getElementById('modalTitle').textContent = 'Edit Press Item';
  document.getElementById('pressId').value = id;
  document.getElementById('title').value = item.title || '';
  document.getElementById('description').value = item.description || '';
  document.getElementById('imageUrl').value = item.image_url || '';
  document.getElementById('linkUrl').value = item.link_url || '';
  document.getElementById('linkType').value = item.link_type || 'external';
  document.getElementById('displayOrder').value = item.display_order || 0;

  // Format datetime for input
  if (item.published_at) {
    const date = new Date(item.published_at);
    const formatted = date.toISOString().slice(0, 16);
    document.getElementById('publishedAt').value = formatted;
  } else {
    document.getElementById('publishedAt').value = '';
  }

  document.getElementById('pressModal').classList.add('active');
}

// Save press item
async function savePressItem(event, isDraft = false) {
  event.preventDefault();

  const form = document.getElementById('pressForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim() || null,
    image_url: document.getElementById('imageUrl').value.trim(),
    link_url: document.getElementById('linkUrl').value.trim(),
    link_type: document.getElementById('linkType').value,
    display_order: parseInt(document.getElementById('displayOrder').value) || 0,
    published_at: isDraft ? null : (document.getElementById('publishedAt').value || new Date().toISOString()),
    site: window.SiteSelector.getSelectedSite()
  };

  try {
    const saveBtn = document.getElementById('saveBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    const originalText = saveBtnText.textContent;

    saveBtn.disabled = true;
    saveBtnText.textContent = 'Saving...';

    let result;

    if (currentPressId) {
      // Update existing
      result = await window.Supabase.client
        .from('press_items')
        .update(formData)
        .eq('id', currentPressId)
        .select()
        .single();
    } else {
      // Create new
      result = await window.Supabase.client
        .from('press_items')
        .insert([formData])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    showAlert(
      currentPressId ? 'Press item updated successfully' : 'Press item created successfully',
      'success'
    );

    closePressModal();
    await loadPressItems();

  } catch (error) {
    console.error('Error saving press item:', error);
    showAlert('Failed to save press item: ' + error.message, 'error');
  } finally {
    const saveBtn = document.getElementById('saveBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    saveBtn.disabled = false;
    saveBtnText.textContent = currentPressId ? 'Update' : 'Publish';
  }
}

// Close press modal
function closePressModal() {
  document.getElementById('pressModal').classList.remove('active');
  currentPressId = null;
}

// Open delete confirmation modal
function openDeleteModal(id, title) {
  currentPressId = id;
  document.getElementById('deletePressName').textContent = title;
  document.getElementById('deleteModal').classList.add('active');
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  currentPressId = null;
}

// Confirm delete
async function confirmDelete() {
  if (!currentPressId) return;

  try {
    const { error } = await window.Supabase.client
      .from('press_items')
      .delete()
      .eq('id', currentPressId);

    if (error) throw error;

    showAlert('Press item deleted successfully', 'success');
    closeDeleteModal();
    await loadPressItems();

  } catch (error) {
    console.error('Error deleting press item:', error);
    showAlert('Failed to delete press item: ' + error.message, 'error');
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
    if (e.target.id === 'pressModal') closePressModal();
    if (e.target.id === 'deleteModal') closeDeleteModal();
  }
});

// Close modals on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePressModal();
    closeDeleteModal();
  }
});
