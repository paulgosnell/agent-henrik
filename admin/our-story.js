// Our Story Sections Management
let storySections = [];
let currentSectionId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize site selector
  window.SiteSelector.initializeSiteSelector();

  await loadStorySections();
  document.getElementById('statusFilter')?.addEventListener('change', renderSectionsTable);
  document.getElementById('typeFilter')?.addEventListener('change', renderSectionsTable);
  document.getElementById('sectionForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSection(e);
  });
});

async function loadStorySections() {
  try {
    showLoading(true);
    const { data, error } = await window.Supabase.client
      .from('our_story_sections')
      .eq('site', window.SiteSelector.getSelectedSite())
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    storySections = data || [];
    renderSectionsTable();
  } catch (error) {
    console.error('Error loading story sections:', error);
    showAlert('Failed to load story sections', 'error');
  } finally {
    showLoading(false);
  }
}

function renderSectionsTable() {
  const tbody = document.getElementById('sectionsTableBody');
  const emptyState = document.getElementById('emptyState');
  const tableContainer = document.getElementById('tableContainer');
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  const typeFilter = document.getElementById('typeFilter')?.value || 'all';

  if (!tbody) return;

  let filteredSections = storySections;
  if (statusFilter === 'published') filteredSections = filteredSections.filter(s => s.is_published);
  else if (statusFilter === 'draft') filteredSections = filteredSections.filter(s => !s.is_published);
  if (typeFilter !== 'all') filteredSections = filteredSections.filter(s => s.section_type === typeFilter);

  if (filteredSections.length === 0) {
    emptyState?.classList.remove('hidden');
    tableContainer?.classList.add('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  tableContainer?.classList.remove('hidden');

  tbody.innerHTML = filteredSections.map(section => {
    const statusBadge = section.is_published
      ? '<span class="badge badge-success">Published</span>'
      : '<span class="badge badge-draft">Draft</span>';

    const typeColors = {
      hero: 'primary',
      text: 'info',
      image: 'warning',
      quote: 'purple',
      timeline: 'secondary'
    };

    return `
      <tr>
        <td>
          <div>
            <div style="font-weight: 500; margin-bottom: 0.25rem;">${section.title ? escapeHtml(section.title) : '<em>No title</em>'}</div>
            <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6); max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${section.content ? escapeHtml(section.content) : '<em>No content</em>'}
            </div>
          </div>
        </td>
        <td><span class="badge badge-${typeColors[section.section_type] || 'info'}">${escapeHtml(section.section_type)}</span></td>
        <td>${section.display_order}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-icon-edit" onclick="editSection('${section.id}')" title="Edit">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M14.5 2.5L17.5 5.5L6 17H3V14L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="btn-icon btn-icon-delete" onclick="openDeleteModal('${section.id}')" title="Delete">
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

function openAddSectionModal() {
  currentSectionId = null;
  document.getElementById('modalTitle').textContent = 'Add Story Section';
  document.getElementById('sectionForm').reset();
  document.getElementById('sectionId').value = '';
  document.getElementById('displayOrder').value = storySections.length;
  document.getElementById('isPublished').checked = false;
  document.getElementById('metadata').value = '{}';
  document.getElementById('sectionModal').classList.add('active');
}

function editSection(id) {
  const section = storySections.find(s => s.id === id);
  if (!section) return;

  currentSectionId = id;
  document.getElementById('modalTitle').textContent = 'Edit Story Section';
  document.getElementById('sectionId').value = id;
  document.getElementById('sectionType').value = section.section_type || 'text';
  document.getElementById('title').value = section.title || '';
  document.getElementById('content').value = section.content || '';
  document.getElementById('imageUrl').value = section.image_url || '';
  document.getElementById('displayOrder').value = section.display_order || 0;
  document.getElementById('isPublished').checked = section.is_published || false;

  // Format metadata JSON
  try {
    const metadata = section.metadata || {};
    document.getElementById('metadata').value = JSON.stringify(metadata, null, 2);
  } catch (e) {
    document.getElementById('metadata').value = '{}';
  }

  document.getElementById('sectionModal').classList.add('active');
}

async function saveSection(event) {
  event.preventDefault();

  const form = document.getElementById('sectionForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Parse metadata JSON
  let metadata = {};
  try {
    const metadataText = document.getElementById('metadata').value.trim();
    if (metadataText) {
      metadata = JSON.parse(metadataText);
    }
  } catch (e) {
    showAlert('Invalid JSON in metadata field', 'error');
    return;
  }

  const formData = {
    section_type: document.getElementById('sectionType').value,
    title: document.getElementById('title').value.trim() || null,
    content: document.getElementById('content').value.trim() || null,
    image_url: document.getElementById('imageUrl').value.trim() || null,
    display_order: parseInt(document.getElementById('displayOrder').value) || 0,
    metadata: metadata,
    is_published: document.getElementById('isPublished').checked,
    site: window.SiteSelector.getSelectedSite()
  };

  try {
    const saveBtn = document.getElementById('saveBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    saveBtn.disabled = true;
    saveBtnText.textContent = 'Saving...';

    let result;
    if (currentSectionId) {
      result = await window.Supabase.client
        .from('our_story_sections')
        .update(formData)
        .eq('id', currentSectionId)
        .select()
        .single();
    } else {
      result = await window.Supabase.client
        .from('our_story_sections')
        .insert([formData])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    showAlert(
      currentSectionId ? 'Story section updated successfully' : 'Story section created successfully',
      'success'
    );

    closeSectionModal();
    await loadStorySections();
  } catch (error) {
    console.error('Error saving story section:', error);
    showAlert('Failed to save story section: ' + error.message, 'error');
  } finally {
    const saveBtn = document.getElementById('saveBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    saveBtn.disabled = false;
    saveBtnText.textContent = 'Save';
  }
}

function closeSectionModal() {
  document.getElementById('sectionModal').classList.remove('active');
  currentSectionId = null;
}

function openDeleteModal(id) {
  currentSectionId = id;
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  currentSectionId = null;
}

async function confirmDelete() {
  if (!currentSectionId) return;

  try {
    const { error } = await window.Supabase.client
      .from('our_story_sections')
      .delete()
      .eq('id', currentSectionId);

    if (error) throw error;

    showAlert('Story section deleted successfully', 'success');
    closeDeleteModal();
    await loadStorySections();
  } catch (error) {
    console.error('Error deleting story section:', error);
    showAlert('Failed to delete story section: ' + error.message, 'error');
  }
}

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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    if (e.target.id === 'sectionModal') closeSectionModal();
    if (e.target.id === 'deleteModal') closeDeleteModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSectionModal();
    closeDeleteModal();
  }
});
