/**
 * Media Library Management
 * Luxury Travel Sweden CMS
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a 'media' bucket in Supabase Storage
 * 2. Make the bucket public (Settings > Storage > media > Make public)
 * 3. Set up storage policies:
 *    - Allow authenticated users to upload (INSERT)
 *    - Allow authenticated users to delete (DELETE)
 *    - Allow everyone to read (SELECT)
 *
 * 4. Create a 'media' table in your database with this schema:
 *    CREATE TABLE media (
 *      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *      filename TEXT NOT NULL,
 *      original_filename TEXT NOT NULL,
 *      storage_path TEXT NOT NULL UNIQUE,
 *      url TEXT NOT NULL,
 *      size_bytes BIGINT NOT NULL,
 *      mime_type TEXT,
 *      width INTEGER,
 *      height INTEGER,
 *      alt_text TEXT,
 *      caption TEXT,
 *      uploaded_by UUID REFERENCES auth.users(id),
 *      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 *    );
 */

const MediaLibrary = {
    // State
    mediaFiles: [],
    filteredFiles: [],
    currentPreviewItem: null,
    uploadQueue: [],

    // DOM Elements
    uploadZone: null,
    fileInput: null,
    uploadProgress: null,
    mediaGrid: null,
    emptyState: null,
    searchInput: null,
    sortSelect: null,
    mediaCount: null,
    previewModal: null,

    /**
     * Initialize the media library
     */
    async init() {
        console.log('Initializing Media Library...');

        // Cache DOM elements
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.mediaGrid = document.getElementById('mediaGrid');
        this.emptyState = document.getElementById('emptyState');
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        this.mediaCount = document.getElementById('mediaCount');
        this.previewModal = document.getElementById('previewModal');

        // Setup event listeners
        this.setupEventListeners();

        // Run diagnostics
        await this.runDiagnostics();

        // Load media files
        await this.loadMediaFiles();

        // Hide loading screen
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('adminApp').style.display = 'flex';

        console.log('Media Library initialized');
    },

    /**
     * Run diagnostics to check if storage is set up correctly
     */
    async runDiagnostics() {
        const setupBanner = document.getElementById('setupBanner');
        const uploadSection = document.getElementById('uploadSection');
        const setupBucket = document.getElementById('setupBucket');
        const setupTable = document.getElementById('setupTable');

        let hasIssues = false;

        try {
            // Check if media bucket exists
            const { data: buckets, error: bucketsError} = await window.Supabase.client
                .storage
                .listBuckets();

            if (bucketsError) {
                this.updateSetupItem(setupBucket, 'error', 'Media Storage Bucket',
                    'Failed to check bucket status. Please check your Supabase connection.',
                    null);
                hasIssues = true;
            } else {
                const mediaBucket = buckets?.find(b => b.name === 'media');

                if (!mediaBucket) {
                    const instructions = `
                        <div class="setup-instructions">
                            <div class="setup-instructions-title">📋 How to Fix:</div>
                            <ol>
                                <li>Open your <strong>Supabase Dashboard</strong></li>
                                <li>Go to <strong>Storage</strong> in the left sidebar</li>
                                <li>Click <strong>"New bucket"</strong></li>
                                <li>Name it exactly: <code>media</code></li>
                                <li>Toggle <strong>"Public bucket"</strong> to ON</li>
                                <li>Click <strong>"Create bucket"</strong></li>
                                <li>After creating, click on the bucket and go to <strong>"Policies"</strong></li>
                                <li>Add a policy to allow authenticated users to upload</li>
                            </ol>
                        </div>
                    `;
                    this.updateSetupItem(setupBucket, 'error', 'Media Storage Bucket',
                        'The "media" storage bucket does not exist in your Supabase project.',
                        instructions);
                    hasIssues = true;
                } else {
                    this.updateSetupItem(setupBucket, 'success', 'Media Storage Bucket',
                        `✓ Bucket exists and is ${mediaBucket.public ? 'public' : 'private'}`,
                        null);
                }
            }

            // Check if media table exists
            const { error: tableError } = await window.Supabase.client
                .from('media')
                .select('id')
                .limit(1);

            if (tableError) {
                if (tableError.message?.includes('relation') || tableError.message?.includes('does not exist')) {
                    const sqlCode = `CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media"
  ON media FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload media"
  ON media FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete media"
  ON media FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update media"
  ON media FOR UPDATE
  USING (auth.role() = 'authenticated');`;

                    const instructions = `
                        <div class="setup-instructions">
                            <div class="setup-instructions-title">📋 How to Fix:</div>
                            <ol>
                                <li>Open your <strong>Supabase Dashboard</strong></li>
                                <li>Go to <strong>SQL Editor</strong> in the left sidebar</li>
                                <li>Click <strong>"New query"</strong></li>
                                <li>Copy the SQL below and paste it into the editor</li>
                                <li>Click <strong>"Run"</strong> to create the table</li>
                            </ol>
                            <div class="setup-sql">${this.escapeHtml(sqlCode)}</div>
                            <button class="btn-copy-sql" onclick="MediaLibrary.copySqlToClipboard()">
                                📋 Copy SQL to Clipboard
                            </button>
                        </div>
                    `;
                    this.updateSetupItem(setupTable, 'error', 'Media Database Table',
                        'The "media" table does not exist in your database.',
                        instructions);
                    hasIssues = true;
                } else {
                    this.updateSetupItem(setupTable, 'error', 'Media Database Table',
                        `Error checking table: ${tableError.message}`,
                        null);
                    hasIssues = true;
                }
            } else {
                this.updateSetupItem(setupTable, 'success', 'Media Database Table',
                    '✓ Table exists and is accessible',
                    null);
            }

        } catch (error) {
            console.error('Diagnostic check failed:', error);
            this.showNotification('Failed to run diagnostics. Check console for details.', 'error');
        }

        // Show/hide setup banner based on results
        if (hasIssues) {
            setupBanner.classList.add('show');
            uploadSection.style.display = 'none';
        } else {
            setupBanner.classList.remove('show');
            uploadSection.style.display = 'block';
        }
    },

    /**
     * Update setup item UI
     */
    updateSetupItem(element, status, title, description, instructions) {
        const statusIcon = element.querySelector('.setup-item-status');
        const titleEl = element.querySelector('.setup-item-title');
        const descEl = element.querySelector('.setup-item-description');

        // Update status icon
        statusIcon.className = 'setup-item-status ' + status;
        if (status === 'success') {
            statusIcon.textContent = '✅';
        } else if (status === 'error') {
            statusIcon.textContent = '❌';
        } else {
            statusIcon.textContent = '⏳';
        }

        // Update text
        titleEl.textContent = title;
        descEl.textContent = description;

        // Add/remove instructions
        const existingInstructions = element.querySelector('.setup-instructions');
        if (existingInstructions) {
            existingInstructions.remove();
        }

        if (instructions) {
            const contentDiv = element.querySelector('.setup-item-content');
            contentDiv.insertAdjacentHTML('beforeend', instructions);
        }
    },

    /**
     * Re-check setup (user clicked button)
     */
    async recheckSetup() {
        await this.runDiagnostics();
        if (!document.getElementById('setupBanner').classList.contains('show')) {
            this.showNotification('✓ Setup complete! You can now upload images.', 'success');
            await this.loadMediaFiles();
        }
    },

    /**
     * Copy SQL to clipboard
     */
    async copySqlToClipboard() {
        const sqlCode = document.querySelector('.setup-sql').textContent;
        try {
            await navigator.clipboard.writeText(sqlCode);
            this.showNotification('SQL copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy SQL:', error);
            this.showNotification('Failed to copy SQL', 'error');
        }
    },

    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Drag and drop
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('drag-over');
        });

        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.classList.remove('drag-over');
        });

        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files);
        });

        // Click to upload
        this.uploadZone.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Search
        this.searchInput.addEventListener('input', () => {
            this.filterAndSort();
        });

        // Sort
        this.sortSelect.addEventListener('change', () => {
            this.filterAndSort();
        });

        // Close modal on backdrop click
        this.previewModal.addEventListener('click', (e) => {
            if (e.target === this.previewModal) {
                this.closePreview();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.previewModal.classList.contains('active')) {
                this.closePreview();
            }
        });
    },

    /**
     * Load all media files from database
     */
    async loadMediaFiles() {
        try {
            this.showLoading();

            const files = await window.Supabase.storage.getMediaFiles();
            this.mediaFiles = files;

            // Load image dimensions for files that don't have them
            await this.loadImageDimensions();

            this.filterAndSort();
        } catch (error) {
            console.error('Error loading media files:', error);
            this.showNotification('Failed to load media files', 'error');
            this.showEmpty();
        }
    },

    /**
     * Load dimensions for images that don't have them cached
     */
    async loadImageDimensions() {
        const promises = this.mediaFiles
            .filter(file => !file.width || !file.height)
            .map(file => this.getImageDimensions(file.url));

        const dimensions = await Promise.all(promises);

        let index = 0;
        for (const file of this.mediaFiles) {
            if (!file.width || !file.height) {
                const dims = dimensions[index];
                if (dims) {
                    file.width = dims.width;
                    file.height = dims.height;

                    // Update in database (don't await to avoid blocking)
                    window.Supabase.client
                        .from('media')
                        .update({ width: dims.width, height: dims.height })
                        .eq('id', file.id)
                        .then(() => {})
                        .catch(err => console.error('Failed to update dimensions:', err));
                }
                index++;
            }
        }
    },

    /**
     * Get image dimensions
     */
    getImageDimensions(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => {
                resolve(null);
            };
            img.src = url;
        });
    },

    /**
     * Filter and sort media files
     */
    filterAndSort() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const sortBy = this.sortSelect.value;

        // Filter
        this.filteredFiles = this.mediaFiles.filter(file =>
            file.filename.toLowerCase().includes(searchTerm) ||
            file.original_filename.toLowerCase().includes(searchTerm)
        );

        // Sort
        this.filteredFiles.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'date-asc':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'name-asc':
                    return a.filename.localeCompare(b.filename);
                case 'name-desc':
                    return b.filename.localeCompare(a.filename);
                case 'size-desc':
                    return b.size_bytes - a.size_bytes;
                case 'size-asc':
                    return a.size_bytes - b.size_bytes;
                default:
                    return 0;
            }
        });

        this.renderMediaGrid();
    },

    /**
     * Render the media grid
     */
    renderMediaGrid() {
        if (this.filteredFiles.length === 0) {
            this.showEmpty();
            return;
        }

        this.hideEmpty();

        // Update count
        this.mediaCount.textContent = this.filteredFiles.length;

        // Render grid
        this.mediaGrid.innerHTML = this.filteredFiles.map(file => this.createMediaItem(file)).join('');
    },

    /**
     * Create HTML for a single media item
     */
    createMediaItem(file) {
        const fileSize = this.formatFileSize(file.size_bytes);
        const dimensions = file.width && file.height ? `${file.width}×${file.height}` : 'Unknown';
        const uploadDate = this.formatDate(file.created_at);

        return `
            <div class="media-item" data-media-id="${file.id}">
                <div class="media-thumbnail" onclick="MediaLibrary.openPreview('${file.id}')">
                    <img src="${file.url}" alt="${file.alt_text || file.filename}" loading="lazy">
                </div>
                <div class="media-info">
                    <div class="media-filename" title="${file.original_filename}">${file.filename}</div>
                    <div class="media-meta">${fileSize} • ${dimensions}</div>
                    <div class="media-actions">
                        <button class="btn-icon" onclick="MediaLibrary.copyUrl('${file.url}'); event.stopPropagation();" title="Copy URL">
                            <span>🔗</span>
                        </button>
                        <button class="btn-icon" onclick="MediaLibrary.openPreview('${file.id}'); event.stopPropagation();" title="View">
                            <span>👁️</span>
                        </button>
                        <button class="btn-icon btn-danger" onclick="MediaLibrary.confirmDelete('${file.id}'); event.stopPropagation();" title="Delete">
                            <span>🗑️</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Handle file selection
     */
    async handleFileSelect(files) {
        const fileArray = Array.from(files);

        // Validate files
        const validFiles = [];
        for (const file of fileArray) {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                this.showNotification(validation.error, 'error');
            }
        }

        if (validFiles.length === 0) return;

        // Upload files
        this.uploadFiles(validFiles);
    },

    /**
     * Validate a file
     */
    validateFile(file) {
        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                error: `${file.name}: Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.`
            };
        }

        // Check file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `${file.name}: File too large. Maximum size is 10MB.`
            };
        }

        return { valid: true };
    },

    /**
     * Upload multiple files
     */
    async uploadFiles(files) {
        this.uploadProgress.classList.add('active');
        this.uploadProgress.innerHTML = '';

        for (const file of files) {
            await this.uploadSingleFile(file);
        }

        // Reload media files after all uploads complete
        await this.loadMediaFiles();

        // Hide upload progress after a delay
        setTimeout(() => {
            this.uploadProgress.classList.remove('active');
        }, 2000);
    },

    /**
     * Upload a single file
     */
    async uploadSingleFile(file) {
        const uploadId = Date.now() + Math.random();
        const uploadItem = this.createUploadItem(file, uploadId);
        this.uploadProgress.appendChild(uploadItem);

        try {
            // Get image preview
            const preview = await this.getImagePreview(file);
            const previewImg = uploadItem.querySelector('.upload-item-preview');
            if (preview) {
                previewImg.src = preview;
            }

            // Update status
            this.updateUploadStatus(uploadId, 'Uploading...', 50);

            // Upload file
            const result = await window.Supabase.storage.uploadFile(file);

            // Get dimensions
            const dimensions = await this.getImageDimensions(result.url);
            if (dimensions && result.mediaId) {
                await window.Supabase.client
                    .from('media')
                    .update({
                        width: dimensions.width,
                        height: dimensions.height
                    })
                    .eq('id', result.mediaId);
            }

            // Update status
            this.updateUploadStatus(uploadId, 'Upload complete!', 100, true);

        } catch (error) {
            console.error('Upload error details:', error);

            // Provide more helpful error messages
            let errorMessage = error.message;

            if (error.message?.includes('Bucket not found') || error.statusCode === '404') {
                errorMessage = 'Media bucket not found. Please create a "media" bucket in Supabase Storage.';
            } else if (error.message?.includes('permission') || error.message?.includes('policy') || error.statusCode === '403') {
                errorMessage = 'Permission denied. Please check storage policies in Supabase.';
            } else if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
                errorMessage = 'Media table not found. Please create the media table in your database.';
            }

            this.updateUploadStatus(uploadId, `Error: ${errorMessage}`, 0, false, true);
            this.showNotification(errorMessage, 'error');
        }
    },

    /**
     * Create upload progress item
     */
    createUploadItem(file, uploadId) {
        const div = document.createElement('div');
        div.className = 'upload-item';
        div.dataset.uploadId = uploadId;

        const fileSize = this.formatFileSize(file.size);

        div.innerHTML = `
            <img class="upload-item-preview" src="" alt="">
            <div class="upload-item-info">
                <div class="upload-item-name">${file.name}</div>
                <div class="upload-item-status">Preparing... (${fileSize})</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;

        return div;
    },

    /**
     * Update upload status
     */
    updateUploadStatus(uploadId, status, progress, success = false, error = false) {
        const item = this.uploadProgress.querySelector(`[data-upload-id="${uploadId}"]`);
        if (!item) return;

        const statusEl = item.querySelector('.upload-item-status');
        const progressFill = item.querySelector('.progress-fill');

        statusEl.textContent = status;
        progressFill.style.width = `${progress}%`;

        if (success) {
            statusEl.classList.add('success');
        }
        if (error) {
            statusEl.classList.add('error');
        }
    },

    /**
     * Get image preview as data URL
     */
    getImagePreview(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    },

    /**
     * Open preview modal
     */
    openPreview(mediaId) {
        const file = this.mediaFiles.find(f => f.id === mediaId);
        if (!file) return;

        this.currentPreviewItem = file;

        // Update modal content
        document.getElementById('previewImage').src = file.url;
        document.getElementById('previewFilename').textContent = file.original_filename;
        document.getElementById('previewSize').textContent = this.formatFileSize(file.size_bytes);
        document.getElementById('previewDimensions').textContent =
            file.width && file.height ? `${file.width} × ${file.height}` : 'Unknown';
        document.getElementById('previewDate').textContent = this.formatDate(file.created_at);
        document.getElementById('previewUrl').textContent = file.url;
        document.getElementById('editAltText').value = file.alt_text || '';
        document.getElementById('editCaption').value = file.caption || '';

        // Show modal
        this.previewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close preview modal
     */
    closePreview() {
        this.previewModal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentPreviewItem = null;
    },

    /**
     * Copy URL to clipboard
     */
    async copyUrl(url = null) {
        const urlToCopy = url || (this.currentPreviewItem ? this.currentPreviewItem.url : null);
        if (!urlToCopy) return;

        try {
            await navigator.clipboard.writeText(urlToCopy);
            this.showNotification('URL copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy URL:', error);
            this.showNotification('Failed to copy URL', 'error');
        }
    },

    /**
     * Save image metadata (alt text and caption)
     */
    async saveImageMetadata() {
        if (!this.currentPreviewItem) return;

        const altText = document.getElementById('editAltText').value;
        const caption = document.getElementById('editCaption').value;

        try {
            await window.Supabase.client
                .from('media')
                .update({
                    alt_text: altText,
                    caption: caption,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentPreviewItem.id);

            // Update local data
            this.currentPreviewItem.alt_text = altText;
            this.currentPreviewItem.caption = caption;

            // Update in mediaFiles array
            const index = this.mediaFiles.findIndex(f => f.id === this.currentPreviewItem.id);
            if (index !== -1) {
                this.mediaFiles[index] = { ...this.currentPreviewItem };
            }

            this.showNotification('Image metadata saved!', 'success');
            this.closePreview();
        } catch (error) {
            console.error('Error saving metadata:', error);
            this.showNotification('Failed to save metadata', 'error');
        }
    },

    /**
     * Confirm delete
     */
    confirmDelete(mediaId) {
        const file = this.mediaFiles.find(f => f.id === mediaId);
        if (!file) return;

        if (confirm(`Are you sure you want to delete "${file.original_filename}"?\n\nThis action cannot be undone.`)) {
            this.deleteImage(mediaId);
        }
    },

    /**
     * Delete current image from preview
     */
    deleteCurrentImage() {
        if (!this.currentPreviewItem) return;

        if (confirm(`Are you sure you want to delete "${this.currentPreviewItem.original_filename}"?\n\nThis action cannot be undone.`)) {
            this.deleteImage(this.currentPreviewItem.id);
            this.closePreview();
        }
    },

    /**
     * Delete an image
     */
    async deleteImage(mediaId) {
        const file = this.mediaFiles.find(f => f.id === mediaId);
        if (!file) return;

        try {
            // Delete from storage and database
            await window.Supabase.storage.deleteFile(file.storage_path);

            // Remove from local array
            this.mediaFiles = this.mediaFiles.filter(f => f.id !== mediaId);

            // Re-render
            this.filterAndSort();

            this.showNotification('Image deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting image:', error);
            this.showNotification('Failed to delete image', 'error');
        }
    },

    /**
     * Show notification toast
     */
    showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;

        const icon = type === 'success' ? '✓' : '✕';
        toast.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
        `;

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInUp 0.3s ease reverse';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    },

    /**
     * Show loading state
     */
    showLoading() {
        this.mediaGrid.innerHTML = `
            <div class="media-loading">
                <div class="loading-spinner"></div>
            </div>
        `;
        this.emptyState.style.display = 'none';
    },

    /**
     * Show empty state
     */
    showEmpty() {
        this.mediaGrid.innerHTML = '';
        this.emptyState.style.display = 'block';
        this.mediaCount.textContent = '0';
    },

    /**
     * Hide empty state
     */
    hideEmpty() {
        this.emptyState.style.display = 'none';
    },

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // Less than 1 minute
        if (diff < 60000) {
            return 'Just now';
        }

        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }

        // Less than 1 day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }

        // Less than 1 week
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }

        // Format as date
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
};

// Export for global access
window.MediaLibrary = MediaLibrary;
