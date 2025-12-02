// Pricing Tiers Management
let pricingTiers = [];
let currentPricingId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadPricingTiers();
  document.getElementById('statusFilter')?.addEventListener('change', renderPricingTable);
  document.getElementById('pricingForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    savePricing(e);
  });
});

async function loadPricingTiers() {
  try {
    showLoading(true);
    const { data, error } = await window.Supabase.client
      .from('pricing_tiers')
      .select('*')
      .eq('site', window.CURRENT_SITE || 'sweden')
      .order('display_order', { ascending: true });
    if (error) throw error;
    pricingTiers = data || [];
    renderPricingTable();
  } catch (error) {
    console.error('Error loading pricing tiers:', error);
    showAlert('Failed to load pricing tiers', 'error');
  } finally {
    showLoading(false);
  }
}

function renderPricingTable() {
  const tbody = document.getElementById('pricingTableBody');
  const emptyState = document.getElementById('emptyState');
  const tableContainer = document.getElementById('tableContainer');
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';

  if (!tbody) return;

  let filteredTiers = pricingTiers;
  if (statusFilter === 'published') filteredTiers = pricingTiers.filter(t => t.is_published);
  else if (statusFilter === 'draft') filteredTiers = pricingTiers.filter(t => !t.is_published);

  if (filteredTiers.length === 0) {
    emptyState?.classList.remove('hidden');
    tableContainer?.classList.add('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  tableContainer?.classList.remove('hidden');

  tbody.innerHTML = filteredTiers.map(tier => {
    const statusBadge = tier.is_published
      ? '<span class="badge badge-success">Published</span>'
      : '<span class="badge badge-draft">Draft</span>';

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
            <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <use href="#icon-${escapeHtml(tier.icon_name || 'sparkles')}"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: 500; margin-bottom: 0.25rem;">${escapeHtml(tier.title)}</div>
              <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6); max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(tier.description)}</div>
            </div>
          </div>
        </td>
        <td>${tier.price_info ? escapeHtml(tier.price_info) : '-'}</td>
        <td>${tier.display_order}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-icon-edit" onclick="editPricing('${tier.id}')" title="Edit">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M14.5 2.5L17.5 5.5L6 17H3V14L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="btn-icon btn-icon-delete" onclick="openDeleteModal('${tier.id}', '${escapeHtml(tier.title)}')" title="Delete">
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

function openAddPricingModal() {
  currentPricingId = null;
  document.getElementById('modalTitle').textContent = 'Add Pricing Tier';
  document.getElementById('pricingForm').reset();
  document.getElementById('pricingId').value = '';
  document.getElementById('displayOrder').value = pricingTiers.length;
  document.getElementById('isPublished').checked = false;
  document.getElementById('iconName').value = 'sparkles';
  document.getElementById('pricingModal').classList.add('active');
}

function editPricing(id) {
  const tier = pricingTiers.find(t => t.id === id);
  if (!tier) return;

  currentPricingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Pricing Tier';
  document.getElementById('pricingId').value = id;
  document.getElementById('title').value = tier.title || '';
  document.getElementById('description').value = tier.description || '';
  document.getElementById('iconName').value = tier.icon_name || 'sparkles';
  document.getElementById('priceInfo').value = tier.price_info || '';
  document.getElementById('displayOrder').value = tier.display_order || 0;
  document.getElementById('isPublished').checked = tier.is_published || false;
  document.getElementById('pricingModal').classList.add('active');
}

async function savePricing(event) {
  event.preventDefault();

  const form = document.getElementById('pricingForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    icon_name: document.getElementById('iconName').value.trim() || 'sparkles',
    price_info: document.getElementById('priceInfo').value.trim() || null,
    display_order: parseInt(document.getElementById('displayOrder').value) || 0,
    is_published: document.getElementById('isPublished').checked,
    site: window.CURRENT_SITE || 'sweden'
  };

  try {
    const saveBtn = document.getElementById('saveBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    saveBtn.disabled = true;
    saveBtnText.textContent = 'Saving...';

    let result;
    if (currentPricingId) {
      result = await window.Supabase.client
        .from('pricing_tiers')
        .update(formData)
        .eq('id', currentPricingId)
        .eq('site', window.CURRENT_SITE || 'sweden')
        .select()
        .single();
    } else {
      result = await window.Supabase.client
        .from('pricing_tiers')
        .insert([formData])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    showAlert(
      currentPricingId ? 'Pricing tier updated successfully' : 'Pricing tier created successfully',
      'success'
    );

    closePricingModal();
    await loadPricingTiers();
  } catch (error) {
    console.error('Error saving pricing tier:', error);
    showAlert('Failed to save pricing tier: ' + error.message, 'error');
  } finally {
    const saveBtn = document.getElementById('saveBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    saveBtn.disabled = false;
    saveBtnText.textContent = 'Save';
  }
}

function closePricingModal() {
  document.getElementById('pricingModal').classList.remove('active');
  currentPricingId = null;
}

function openDeleteModal(id, name) {
  currentPricingId = id;
  document.getElementById('deletePricingName').textContent = name;
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  currentPricingId = null;
}

async function confirmDelete() {
  if (!currentPricingId) return;

  try {
    const { error } = await window.Supabase.client
      .from('pricing_tiers')
      .delete()
      .eq('id', currentPricingId)
      .eq('site', window.CURRENT_SITE || 'sweden');

    if (error) throw error;

    showAlert('Pricing tier deleted successfully', 'success');
    closeDeleteModal();
    await loadPricingTiers();
  } catch (error) {
    console.error('Error deleting pricing tier:', error);
    showAlert('Failed to delete pricing tier: ' + error.message, 'error');
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
    if (e.target.id === 'pricingModal') closePricingModal();
    if (e.target.id === 'deleteModal') closeDeleteModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePricingModal();
    closeDeleteModal();
  }
});
