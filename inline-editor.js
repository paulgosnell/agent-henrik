/**
 * Inline Editor for Luxury Travel Sweden
 *
 * Allows authenticated clients to edit static content directly on the page.
 * Integrates with Supabase backend for content storage.
 *
 * Features:
 * - Authentication check before editing
 * - Visual indicators for editable elements
 * - Change tracking and batch saving
 * - Unsaved changes warning
 * - Success/error notifications
 */

// ==========================================
// STATE MANAGEMENT
// ==========================================

const InlineEditor = {
  // Editor state
  isEditMode: false,
  isAuthenticated: false,
  currentUser: null,

  // Change tracking
  trackedChanges: {},
  originalValues: {},

  // UI elements (created dynamically)
  editModeBtn: null,
  saveChangesBtn: null,

  // Loading state
  isSaving: false
};

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize the inline editor
 * Check authentication and setup UI
 */
async function initInlineEditor() {
  console.log('🎨 Initializing inline editor...');

  // Wait for Supabase to be ready
  if (!window.Supabase || !window.Supabase.isConfigured()) {
    console.warn('⚠️ Supabase not configured - inline editor disabled');
    return;
  }

  try {
    // Check authentication
    InlineEditor.currentUser = await window.Supabase.auth.getUser();
    InlineEditor.isAuthenticated = !!InlineEditor.currentUser;

    // Load static content from database
    await loadStaticContent();

    // Create UI elements
    createEditorUI();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Setup unsaved changes warning
    setupBeforeUnloadWarning();

    console.log('✅ Inline editor initialized');

  } catch (error) {
    console.error('❌ Failed to initialize inline editor:', error);
  }
}

// ==========================================
// CONTENT LOADING
// ==========================================

/**
 * Load static content from Supabase and populate elements
 */
async function loadStaticContent() {
  try {
    const content = await window.Supabase.db.getStaticContent();

    // Update all elements with data-editable attributes
    document.querySelectorAll('[data-editable]').forEach(el => {
      const key = el.getAttribute('data-editable');

      // Store current content as original (whether from DB or HTML)
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        InlineEditor.originalValues[key] = content[key] || el.value;
        if (content[key]) {
          el.value = content[key];
        }
      } else {
        // Use innerHTML to preserve rich content (links, spans, etc.)
        InlineEditor.originalValues[key] = content[key] || el.innerHTML;
        if (content[key]) {
          // Check if content has HTML tags
          if (/<[a-z][\s\S]*>/i.test(content[key])) {
            el.innerHTML = content[key];
          } else {
            el.textContent = content[key];
          }
        }
      }
    });

    console.log('✅ Static content loaded from database');
  } catch (error) {
    console.error('❌ Failed to load static content:', error);
    // Continue anyway - page may have default values
  }
}

// ==========================================
// UI CREATION
// ==========================================

/**
 * Create the editor UI buttons
 */
function createEditorUI() {
  // Create edit mode toggle button
  InlineEditor.editModeBtn = document.createElement('button');
  InlineEditor.editModeBtn.id = 'editModeBtn';
  InlineEditor.editModeBtn.className = 'edit-mode-btn';
  InlineEditor.editModeBtn.setAttribute('aria-label', 'Toggle edit mode');

  if (!InlineEditor.isAuthenticated) {
    // Show login prompt
    InlineEditor.editModeBtn.innerHTML = `
      <span class="edit-mode-icon">🔒</span>
      <span class="edit-mode-text">Login to Edit</span>
    `;
    InlineEditor.editModeBtn.onclick = () => {
      window.location.href = '/admin/login.html';
    };
  } else {
    // Show edit mode toggle
    InlineEditor.editModeBtn.innerHTML = `
      <span class="edit-mode-icon">✏️</span>
      <span class="edit-mode-text">Edit Mode: OFF</span>
    `;
    InlineEditor.editModeBtn.onclick = toggleEditMode;
  }

  // Append to footer instead of body (keep it discreet)
  const footer = document.querySelector('footer') || document.body;
  footer.appendChild(InlineEditor.editModeBtn);

  // Create save changes button (initially hidden)
  InlineEditor.saveChangesBtn = document.createElement('button');
  InlineEditor.saveChangesBtn.id = 'saveChangesBtn';
  InlineEditor.saveChangesBtn.className = 'save-changes-btn';
  InlineEditor.saveChangesBtn.style.display = 'none';
  InlineEditor.saveChangesBtn.setAttribute('aria-label', 'Save changes');
  InlineEditor.saveChangesBtn.innerHTML = `
    <span class="save-icon">💾</span>
    <span class="save-text">Save Changes</span>
  `;
  InlineEditor.saveChangesBtn.onclick = saveChanges;

  footer.appendChild(InlineEditor.saveChangesBtn);
}

// ==========================================
// EDIT MODE MANAGEMENT
// ==========================================

/**
 * Toggle edit mode on/off
 */
function toggleEditMode() {
  if (!InlineEditor.isAuthenticated) {
    alert('Please log in to edit content');
    return;
  }

  InlineEditor.isEditMode = !InlineEditor.isEditMode;

  if (InlineEditor.isEditMode) {
    enableEditMode();
  } else {
    disableEditMode();
  }

  updateEditModeButton();
}

/**
 * Enable edit mode - make elements editable
 */
function enableEditMode() {
  const editableElements = document.querySelectorAll('[data-editable]');

  editableElements.forEach(el => {
    // Make element editable
    if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'BUTTON') {
      el.contentEditable = true;
      el.setAttribute('spellcheck', 'true');
    }

    // Add visual indicator
    el.classList.add('editable-active');

    // Add tooltip
    const key = el.getAttribute('data-editable');
    el.setAttribute('title', `Editing: ${key}`);

    // Track changes
    el.addEventListener('input', handleElementChange);
    el.addEventListener('blur', handleElementChange);
  });

  // Show save button
  InlineEditor.saveChangesBtn.style.display = 'flex';

  console.log('✅ Edit mode enabled');
}

/**
 * Disable edit mode - make elements non-editable
 */
function disableEditMode() {
  const editableElements = document.querySelectorAll('[data-editable]');

  editableElements.forEach(el => {
    // Make element non-editable
    if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'BUTTON') {
      el.contentEditable = false;
      el.removeAttribute('spellcheck');
    }

    // Remove visual indicators
    el.classList.remove('editable-active', 'changed');
    el.removeAttribute('title');

    // Remove event listeners
    el.removeEventListener('input', handleElementChange);
    el.removeEventListener('blur', handleElementChange);
  });

  // Hide save button if no changes
  if (Object.keys(InlineEditor.trackedChanges).length === 0) {
    InlineEditor.saveChangesBtn.style.display = 'none';
  }

  console.log('✅ Edit mode disabled');
}

/**
 * Update edit mode button appearance
 */
function updateEditModeButton() {
  const btn = InlineEditor.editModeBtn;
  const icon = btn.querySelector('.edit-mode-icon');
  const text = btn.querySelector('.edit-mode-text');

  if (InlineEditor.isEditMode) {
    btn.classList.add('active');
    icon.textContent = '✏️';
    text.textContent = 'Edit Mode: ON';
  } else {
    btn.classList.remove('active');
    icon.textContent = '✏️';
    text.textContent = 'Edit Mode: OFF';
  }
}

// ==========================================
// CHANGE TRACKING
// ==========================================

/**
 * Handle changes to editable elements
 */
function handleElementChange(event) {
  const el = event.target;
  const key = el.getAttribute('data-editable');

  if (!key) return;

  // Get current value
  let currentValue;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    currentValue = el.value.trim();
  } else {
    // Use innerHTML to preserve rich content (links, spans, etc.)
    currentValue = el.innerHTML.trim();
  }

  // Get original value
  const originalValue = InlineEditor.originalValues[key] || '';

  // Check if value has changed
  if (currentValue !== originalValue) {
    // Track the change
    InlineEditor.trackedChanges[key] = currentValue;
    el.classList.add('changed');

    // Update save button
    updateSaveButton();
  } else {
    // Remove from tracked changes if reverted to original
    delete InlineEditor.trackedChanges[key];
    el.classList.remove('changed');

    // Update save button
    updateSaveButton();
  }
}

/**
 * Update save button state based on changes
 */
function updateSaveButton() {
  const changeCount = Object.keys(InlineEditor.trackedChanges).length;
  const saveText = InlineEditor.saveChangesBtn.querySelector('.save-text');

  if (changeCount > 0) {
    saveText.textContent = `Save Changes (${changeCount})`;
    InlineEditor.saveChangesBtn.style.display = 'flex';
    InlineEditor.saveChangesBtn.classList.add('has-changes');
  } else {
    saveText.textContent = 'Save Changes';
    if (!InlineEditor.isEditMode) {
      InlineEditor.saveChangesBtn.style.display = 'none';
    }
    InlineEditor.saveChangesBtn.classList.remove('has-changes');
  }
}

// ==========================================
// SAVING CHANGES
// ==========================================

/**
 * Save all tracked changes to Supabase
 */
async function saveChanges() {
  if (InlineEditor.isSaving) {
    return; // Prevent double-clicking
  }

  const changeCount = Object.keys(InlineEditor.trackedChanges).length;

  if (changeCount === 0) {
    showNotification('No changes to save', 'info');
    return;
  }

  // Confirm save
  const confirmed = confirm(`Save ${changeCount} change${changeCount > 1 ? 's' : ''}?`);
  if (!confirmed) {
    return;
  }

  // Update UI to show saving state
  InlineEditor.isSaving = true;
  updateSaveButtonSaving(true);

  try {
    // Batch update to Supabase
    await window.Supabase.db.batchUpdateStaticContent(InlineEditor.trackedChanges);

    // Update original values
    Object.assign(InlineEditor.originalValues, InlineEditor.trackedChanges);

    // Clear tracked changes
    InlineEditor.trackedChanges = {};

    // Remove changed indicators
    document.querySelectorAll('[data-editable].changed').forEach(el => {
      el.classList.remove('changed');
    });

    // Update save button
    updateSaveButton();

    // Show success notification
    showNotification('Changes saved successfully!', 'success');

    console.log('✅ Changes saved to database');

    // Optional: Reload page after short delay to show fresh content
    setTimeout(() => {
      if (confirm('Reload page to see updated content?')) {
        location.reload();
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Failed to save changes:', error);
    showNotification('Failed to save changes. Please try again.', 'error');
  } finally {
    InlineEditor.isSaving = false;
    updateSaveButtonSaving(false);
  }
}

/**
 * Update save button to show saving state
 */
function updateSaveButtonSaving(isSaving) {
  const btn = InlineEditor.saveChangesBtn;
  const icon = btn.querySelector('.save-icon');
  const text = btn.querySelector('.save-text');

  if (isSaving) {
    btn.disabled = true;
    btn.classList.add('saving');
    icon.textContent = '⏳';
    text.textContent = 'Saving...';
  } else {
    btn.disabled = false;
    btn.classList.remove('saving');
    icon.textContent = '💾';
    updateSaveButton(); // Restore normal state
  }
}

// ==========================================
// NOTIFICATIONS
// ==========================================

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `editor-notification editor-notification-${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  notification.innerHTML = `
    <span class="notification-icon">${icon}</span>
    <span class="notification-message">${message}</span>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => notification.classList.add('show'), 10);

  // Remove after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();

      if (Object.keys(InlineEditor.trackedChanges).length > 0) {
        saveChanges();
      }
    }

    // Ctrl/Cmd + E to toggle edit mode (only if authenticated)
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
      event.preventDefault();

      if (InlineEditor.isAuthenticated) {
        toggleEditMode();
      }
    }

    // Escape to exit edit mode
    if (event.key === 'Escape' && InlineEditor.isEditMode) {
      // Check if there are unsaved changes
      if (Object.keys(InlineEditor.trackedChanges).length > 0) {
        const confirmed = confirm('Exit edit mode? You have unsaved changes.');
        if (confirmed) {
          toggleEditMode();
        }
      } else {
        toggleEditMode();
      }
    }
  });

  console.log('⌨️ Keyboard shortcuts enabled:');
  console.log('   - Ctrl/Cmd + S: Save changes');
  console.log('   - Ctrl/Cmd + E: Toggle edit mode');
  console.log('   - Escape: Exit edit mode');
}

// ==========================================
// UNSAVED CHANGES WARNING
// ==========================================

/**
 * Warn user before leaving page with unsaved changes
 */
function setupBeforeUnloadWarning() {
  window.addEventListener('beforeunload', (event) => {
    if (Object.keys(InlineEditor.trackedChanges).length > 0) {
      event.preventDefault();
      event.returnValue = ''; // Chrome requires returnValue to be set
      return ''; // Some browsers need a return value
    }
  });
}

// ==========================================
// EXPORT API
// ==========================================

window.InlineEditor = {
  init: initInlineEditor,
  toggleEditMode,
  saveChanges,
  isEditMode: () => InlineEditor.isEditMode,
  getChanges: () => InlineEditor.trackedChanges,
  hasChanges: () => Object.keys(InlineEditor.trackedChanges).length > 0
};

// ==========================================
// AUTO-INITIALIZE
// ==========================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInlineEditor);
} else {
  initInlineEditor();
}
