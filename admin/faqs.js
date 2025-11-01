// FAQ Management
let faqs = [];
let currentFaqId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadFaqs();
  document.getElementById('statusFilter')?.addEventListener('change', renderFaqsTable);
  document.getElementById('categoryFilter')?.addEventListener('change', renderFaqsTable);
  document.getElementById('faqForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveFaq(e);
  });
});

async function loadFaqs() {
  try {
    showLoading(true);
    const { data, error } = await window.Supabase.client
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    faqs = data || [];
    renderFaqsTable();
  } catch (error) {
    console.error('Error loading FAQs:', error);
    showAlert('Failed to load FAQs', 'error');
  } finally {
    showLoading(false);
  }
}

function renderFaqsTable() {
  const tbody = document.getElementById('faqsTableBody');
  const emptyState = document.getElementById('emptyState');
  const tableContainer = document.getElementById('tableContainer');
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';

  if (!tbody) return;

  let filteredFaqs = faqs;
  if (statusFilter === 'published') filteredFaqs = filteredFaqs.filter(f => f.is_published);
  else if (statusFilter === 'draft') filteredFaqs = filteredFaqs.filter(f => !f.is_published);
  if (categoryFilter !== 'all') filteredFaqs = filteredFaqs.filter(f => f.category === categoryFilter);

  if (filteredFaqs.length === 0) {
    emptyState?.classList.remove('hidden');
    tableContainer?.classList.add('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  tableContainer?.classList.remove('hidden');

  tbody.innerHTML = filteredFaqs.map(faq => {
    const statusBadge = faq.is_published
      ? '<span class="badge badge-success">Published</span>'
      : '<span class="badge badge-draft">Draft</span>';

    return `
      <tr>
        <td>
          <div style="font-weight: 500; margin-bottom: 0.25rem;">${escapeHtml(faq.question)}</div>
          <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6); max-width: 500px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(faq.answer)}</div>
        </td>
        <td><span class="badge badge-info">${escapeHtml(faq.category || 'general')}</span></td>
        <td>${faq.display_order}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-icon-edit" onclick="editFaq('${faq.id}')" title="Edit">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M14.5 2.5L17.5 5.5L6 17H3V14L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="btn-icon btn-icon-delete" onclick="openDeleteModal('${faq.id}')" title="Delete">
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

function openAddFaqModal() {
  currentFaqId = null;
  document.getElementById('modalTitle').textContent = 'Add FAQ';
  document.getElementById('faqForm').reset();
  document.getElementById('faqId').value = '';
  document.getElementById('displayOrder').value = faqs.length;
  document.getElementById('isPublished').checked = false;
  document.getElementById('faqModal').classList.add('active');
}

function editFaq(id) {
  const faq = faqs.find(f => f.id === id);
  if (!faq) return;

  currentFaqId = id;
  document.getElementById('modalTitle').textContent = 'Edit FAQ';
  document.getElementById('faqId').value = id;
  document.getElementById('question').value = faq.question || '';
  document.getElementById('answer').value = faq.answer || '';
  document.getElementById('category').value = faq.category || 'general';
  document.getElementById('displayOrder').value = faq.display_order || 0;
  document.getElementById('isPublished').checked = faq.is_published || false;
  document.getElementById('faqModal').classList.add('active');
}

async function saveFaq(event) {
  event.preventDefault();

  const form = document.getElementById('faqForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = {
    question: document.getElementById('question').value.trim(),
    answer: document.getElementById('answer').value.trim(),
    category: document.getElementById('category').value || 'general',
    display_order: parseInt(document.getElementById('displayOrder').value) || 0,
    is_published: document.getElementById('isPublished').checked
  };

  try {
    const saveBtn = document.getElementById('saveBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    saveBtn.disabled = true;
    saveBtnText.textContent = 'Saving...';

    let result;
    if (currentFaqId) {
      result = await window.Supabase.client
        .from('faqs')
        .update(formData)
        .eq('id', currentFaqId)
        .select()
        .single();
    } else {
      result = await window.Supabase.client
        .from('faqs')
        .insert([formData])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    showAlert(
      currentFaqId ? 'FAQ updated successfully' : 'FAQ created successfully',
      'success'
    );

    closeFaqModal();
    await loadFaqs();
  } catch (error) {
    console.error('Error saving FAQ:', error);
    showAlert('Failed to save FAQ: ' + error.message, 'error');
  } finally {
    const saveBtn = document.getElementById('saveBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    saveBtn.disabled = false;
    saveBtnText.textContent = 'Save';
  }
}

function closeFaqModal() {
  document.getElementById('faqModal').classList.remove('active');
  currentFaqId = null;
}

function openDeleteModal(id) {
  currentFaqId = id;
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  currentFaqId = null;
}

async function confirmDelete() {
  if (!currentFaqId) return;

  try {
    const { error } = await window.Supabase.client
      .from('faqs')
      .delete()
      .eq('id', currentFaqId);

    if (error) throw error;

    showAlert('FAQ deleted successfully', 'success');
    closeDeleteModal();
    await loadFaqs();
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    showAlert('Failed to delete FAQ: ' + error.message, 'error');
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
    if (e.target.id === 'faqModal') closeFaqModal();
    if (e.target.id === 'deleteModal') closeDeleteModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeFaqModal();
    closeDeleteModal();
  }
});
