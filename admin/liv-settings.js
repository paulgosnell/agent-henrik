// LIV Settings Management
(function() {
    let currentFilter = 'all';
    let allInstructions = [];

    // Get Supabase client
    const supabase = window.Supabase.client;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async () => {
        // Initialize site selector
        window.SiteSelector.initializeSiteSelector();

        await loadInstructions();
        setupEventListeners();
    });

    function setupEventListeners() {
        // Category filter buttons
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.category;
                renderInstructions();
            });
        });

        // Add instruction button
        document.getElementById('addInstructionBtn').addEventListener('click', openAddModal);

        // Form submission
        document.getElementById('instructionForm').addEventListener('submit', handleFormSubmit);

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            await window.AuthManager.logout();
        });
    }

    async function loadInstructions() {
        try {
            const { data, error } = await supabase
                .from('liv_instructions')
                .eq('site', window.SiteSelector.getSelectedSite())
                .select('*')
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            allInstructions = data || [];
            renderInstructions();

            // Hide loading screen
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('adminApp').style.display = 'flex';
        } catch (error) {
            console.error('Error loading instructions:', error);
            showNotification('Failed to load instructions', 'error');
        }
    }

    function renderInstructions() {
        const container = document.getElementById('instructionsList');

        // Filter instructions
        let filtered = allInstructions;
        if (currentFilter !== 'all') {
            filtered = allInstructions.filter(i => i.category === currentFilter);
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
                        <path d="M32 20V36M32 44H32.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <p>No instructions found${currentFilter !== 'all' ? ' in this category' : ''}.</p>
                    <button class="btn-primary" onclick="window.location.reload()">Refresh</button>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(instruction => `
            <div class="instruction-card" data-id="${instruction.id}">
                <div class="instruction-header">
                    <div class="instruction-title-group">
                        <h3 class="instruction-title">${escapeHtml(instruction.title)}</h3>
                        <div class="instruction-meta">
                            <span class="category-badge ${instruction.category}">${instruction.category}</span>
                            <span class="priority-badge">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M6 2L7.5 5H10L7.5 7L8.5 10L6 8L3.5 10L4.5 7L2 5H4.5L6 2Z" fill="currentColor"/>
                                </svg>
                                Priority: ${instruction.priority}
                            </span>
                        </div>
                    </div>
                    <div class="toggle-active">
                        <span>${instruction.is_active ? 'Active' : 'Inactive'}</span>
                        <div class="toggle-switch ${instruction.is_active ? 'active' : ''}"
                             onclick="toggleActive('${instruction.id}', ${!instruction.is_active})">
                        </div>
                    </div>
                </div>
                <div class="instruction-content">
                    ${escapeHtml(instruction.instruction)}
                </div>
                <div class="instruction-actions">
                    <button class="btn-secondary" onclick="editInstruction('${instruction.id}')">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Edit
                    </button>
                    <button class="btn-danger" onclick="deleteInstruction('${instruction.id}', '${escapeHtml(instruction.title)}')">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    function openAddModal() {
        document.getElementById('modalTitle').textContent = 'Add Instruction';
        document.getElementById('instructionForm').reset();
        document.getElementById('instructionId').value = '';
        document.getElementById('instructionPriority').value = '50';
        document.getElementById('instructionActive').checked = true;
        document.getElementById('instructionModal').classList.add('active');
    }

    window.editInstruction = function(id) {
        const instruction = allInstructions.find(i => i.id === id);
        if (!instruction) return;

        document.getElementById('modalTitle').textContent = 'Edit Instruction';
        document.getElementById('instructionId').value = instruction.id;
        document.getElementById('instructionTitle').value = instruction.title;
        document.getElementById('instructionCategory').value = instruction.category;
        document.getElementById('instructionText').value = instruction.instruction;
        document.getElementById('instructionPriority').value = instruction.priority;
        document.getElementById('instructionActive').checked = instruction.is_active;
        document.getElementById('instructionModal').classList.add('active');
    };

    window.closeInstructionModal = function() {
        document.getElementById('instructionModal').classList.remove('active');
    };

    async function handleFormSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('instructionId').value;
        const data = {
            title: document.getElementById('instructionTitle').value.trim(),
            category: document.getElementById('instructionCategory').value,
            instruction: document.getElementById('instructionText').value.trim(),
            priority: parseInt(document.getElementById('instructionPriority').value),
            is_active: document.getElementById('instructionActive').checked,
            site: window.SiteSelector.getSelectedSite()
        };

        try {
            if (id) {
                // Update existing
                const { error } = await supabase
                    .from('liv_instructions')
                    .update(data)
                    .eq('id', id);

                if (error) throw error;
                showNotification('Instruction updated successfully', 'success');
            } else {
                // Create new
                const { error } = await supabase
                    .from('liv_instructions')
                    .insert([data]);

                if (error) throw error;
                showNotification('Instruction added successfully', 'success');
            }

            closeInstructionModal();
            await loadInstructions();
        } catch (error) {
            console.error('Error saving instruction:', error);
            showNotification('Failed to save instruction', 'error');
        }
    }

    window.toggleActive = async function(id, isActive) {
        try {
            const { error } = await supabase
                .from('liv_instructions')
                .update({ is_active: isActive })
                .eq('id', id);

            if (error) throw error;

            showNotification(`Instruction ${isActive ? 'activated' : 'deactivated'}`, 'success');
            await loadInstructions();
        } catch (error) {
            console.error('Error toggling instruction:', error);
            showNotification('Failed to update instruction', 'error');
        }
    };

    window.deleteInstruction = async function(id, title) {
        if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('liv_instructions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showNotification('Instruction deleted successfully', 'success');
            await loadInstructions();
        } catch (error) {
            console.error('Error deleting instruction:', error);
            showNotification('Failed to delete instruction', 'error');
        }
    };

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();
