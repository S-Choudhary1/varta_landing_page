// EXIF Viewer & Remover - Enhanced Main JavaScript
class EXIFViewer {
    constructor() {
        try {
            this.currentFile = null;
            this.currentImage = null;
            this.exifData = null;
            this.cleanImageData = null;
            this.originalImageData = null;
            this.processingState = 'idle';
            this.selectedEXIFFields = new Set();
            this.analytics = new AnalyticsTracker();
            
            this.initializeElements();
            this.bindEvents();
            this.initializeEXIFStripper();
            this.initializeProgressIndicator();
            this.initializeImagePreview();
            this.initializePWA();
        } catch (error) {
            console.error('Error in EXIFViewer constructor:', error);
            throw error;
        }
    }

    initializeElements() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.uploadBtn = document.querySelector('.upload-btn');
        this.contentArea = document.getElementById('content-area');
        this.imagePreview = document.getElementById('image-preview');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.imageDimensions = document.getElementById('image-dimensions');
        this.metadataContent = document.getElementById('metadata-content');
        this.removeExifBtn = document.getElementById('remove-exif-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        // Enhanced elements
        this.progressContainer = document.getElementById('progress-container');
        this.imageZoomContainer = document.getElementById('image-zoom-container');
        this.comparisonContainer = document.getElementById('comparison-container');
        this.selectiveExifContainer = document.getElementById('selective-exif-container');
        this.exportContainer = document.getElementById('export-container');
        
        console.log('Enhanced elements initialized');
    }

    bindEvents() {
            const openFilePicker = () => {
                console.log('Opening file picker...');
                this.fileInput.click();
            };
        
            // Both upload area and button trigger file picker
            if (this.uploadArea) {
                this.uploadArea.addEventListener('click', openFilePicker);
            }
            if (this.uploadBtn) {
                this.uploadBtn.addEventListener('click', openFilePicker);
            }
        
            // Handle drag & drop
            if (this.uploadArea) {
                this.uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    this.uploadArea.classList.add('dragover');
                });
        
                this.uploadArea.addEventListener('dragleave', () => {
                    this.uploadArea.classList.remove('dragover');
                });
        
                this.uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    this.uploadArea.classList.remove('dragover');
                    this.handleFileUpload(e.dataTransfer.files[0]);
                });
            }
        
            // Handle file input change
            if (this.fileInput) {
                this.fileInput.addEventListener('change', (e) => {
                    this.handleFileUpload(e.target.files[0]);
                });
            }

        // Action buttons
        this.removeExifBtn.addEventListener('click', () => {
            this.removeEXIFData();
        });

        this.downloadBtn.addEventListener('click', () => {
            this.downloadCleanImage();
        });

        this.resetBtn.addEventListener('click', () => {
            this.resetApp();
        });

        // Enhanced button events
        const selectiveExifBtn = document.getElementById('selective-exif-btn');
        const exportExifBtn = document.getElementById('export-exif-btn');
        const zoomBtn = document.getElementById('zoom-btn');

        if (selectiveExifBtn) {
            selectiveExifBtn.addEventListener('click', () => {
                this.showSelectiveExif();
            });
        }

        if (exportExifBtn) {
            exportExifBtn.addEventListener('click', () => {
                this.showExportOptions();
            });
        }

        if (zoomBtn) {
            zoomBtn.addEventListener('click', () => {
                if (this.currentImage) {
                    this.showImageZoom(this.currentImage.src);
                }
            });
        }

        // Bind export button events
        this.bindExportEvents();
        this.bindSelectiveExifEvents();
        this.bindComparisonEvents();
    }

    initializeEXIFStripper() {
        // Initialize the EXIF stripper functionality
        this.exifStripper = new EXIFStripper(this);
    }

    handleFileUpload(file) {
        console.log('handleFileUpload called with file:', file);
        
        // Validate file type
        if (!this.isValidImageFile(file)) {
            console.log('Invalid file type:', file.type);
            this.showMessage('Please select a valid image file (JPG, JPEG, PNG, WebP, BMP)', 'error');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            console.log('File too large:', file.size);
            this.showMessage('File size must be less than 10MB', 'error');
            return;
        }

        // Show loading state
        this.showMessage('Processing image...', 'info');

        try {
            this.currentFile = file;
            this.displayFileInfo(file);
            this.loadImagePreview(file);
            this.extractEXIFData(file);
            this.showContentArea();
            this.enableEnhancedButtons();
            this.showMessage('Image uploaded successfully!', 'success');
            this.analytics.track('image_uploaded', { 
                fileType: file.type, 
                fileSize: file.size,
                fileName: file.name 
            });
        } catch (error) {
            console.error('Error processing file:', error);
            this.showMessage('Error processing image. Please try again.', 'error');
            this.analytics.track('image_upload_failed', { error: error.message });
        }
    }

    isValidImageFile(file) {
        const validTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/bmp'
        ];
        return validTypes.includes(file.type);
    }

    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    loadImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImage = new Image();
            this.currentImage.onload = () => {
                this.imagePreview.src = e.target.result;
                this.imageDimensions.textContent = `${this.currentImage.width} × ${this.currentImage.height}`;
            };
            this.currentImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    extractEXIFData(file) {
        if (typeof EXIF === 'undefined') {
            console.error('EXIF library not loaded!');
            this.showMessage('EXIF library not available. Please refresh the page.', 'error');
            return;
        }
        
        console.log('Extracting EXIF data from file:', file.name);
        EXIF.getData(file, () => {
            this.exifData = EXIF.getAllTags(file);
            console.log('EXIF data extracted:', this.exifData);
            this.displayEXIFData();
        });
    }

    displayEXIFData() {
        if (!this.exifData || Object.keys(this.exifData).length === 0) {
            this.metadataContent.innerHTML = `
                <div class="no-metadata">
                    <p>No EXIF metadata found in this image.</p>
                </div>
            `;
            this.removeExifBtn.disabled = true;
            return;
        }

        const metadataHTML = this.buildMetadataHTML();
        this.metadataContent.innerHTML = metadataHTML;
        this.removeExifBtn.disabled = false;
    }

    buildMetadataHTML() {
        const categories = this.categorizeEXIFData();
        let html = '<div class="metadata-sections">';
        
        // Add summary section
        const summary = this.createMetadataSummary();
        if (summary) {
            html += `
                <div class="metadata-summary-card">
                    <div class="metadata-summary-header">
                        <h4>📊 Metadata Summary</h4>
                    </div>
                    <div class="metadata-summary-content">
                        ${summary}
                    </div>
                </div>
            `;
        }
        
        Object.keys(categories).forEach(category => {
            const categoryData = categories[category];
            if (categoryData.length > 0) {
                html += `
                    <div class="metadata-section-card">
                        <div class="metadata-section-header">
                            <h4>${this.getCategoryIcon(category)} ${category}</h4>
                            <span class="metadata-count">${categoryData.length} items</span>
                        </div>
                        <div class="metadata-section-content">
                `;
                
                categoryData.forEach(item => {
                    const value = this.formatEXIFValue(item.key, item.value);
                    const icon = item.icon || '📋';
                    html += `
                        <div class="metadata-item">
                            <div class="metadata-item-label">
                                <span class="metadata-icon">${icon}</span>
                                <span class="metadata-name">${item.label}</span>
                            </div>
                            <div class="metadata-item-value">${value}</div>
                        </div>
                    `;
                });
                
                html += '</div></div>';
            }
        });
        
        html += '</div>';
        return html;
    }

    createMetadataSummary() {
        const summary = [];
        
        // Camera info
        if (this.exifData.Make && this.exifData.Model) {
            summary.push(`📷 ${this.exifData.Make} ${this.exifData.Model}`);
        }
        
        // Date
        if (this.exifData.DateTimeOriginal) {
            const date = new Date(this.exifData.DateTimeOriginal.replace(/(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));
            summary.push(`📅 ${date.toLocaleDateString()}`);
        }
        
        // Location
        if (this.exifData.GPSLatitude && this.exifData.GPSLongitude) {
            summary.push(`📍 GPS Location Available`);
        }
        
        // Technical details
        if (this.exifData.ExposureTime && this.exifData.FNumber && this.exifData.ISOSpeedRatings) {
            summary.push(`⚙️ ${this.exifData.ExposureTime}s, f/${this.exifData.FNumber}, ISO ${this.exifData.ISOSpeedRatings}`);
        }
        
        if (summary.length > 0) {
            return summary.map(item => `<div class="summary-item">${item}</div>`).join('');
        }
        
        return null;
    }

    getCategoryIcon(category) {
        const icons = {
            'Camera Information': '📷',
            'Image Details': '🖼️',
            'Location Data': '📍',
            'Technical Data': '⚙️',
            'File Information': '📁',
            'Other': '📋'
        };
        return icons[category] || '📋';
    }

    categorizeEXIFData() {
        const categories = {
            'Camera Information': [],
            'Image Details': [],
            'Location Data': [],
            'Technical Data': [],
            'File Information': [],
            'Other': []
        };

        const mappings = {
            // Camera Information
            'Make': { label: 'Camera Make', category: 'Camera Information', icon: '📷' },
            'Model': { label: 'Camera Model', category: 'Camera Information', icon: '📷' },
            'Software': { label: 'Software', category: 'Camera Information', icon: '💻' },
            'Artist': { label: 'Artist', category: 'Camera Information', icon: '👤' },
            'Copyright': { label: 'Copyright', category: 'Camera Information', icon: '©️' },
            'ImageUniqueID': { label: 'Image Unique ID', category: 'Camera Information', icon: '🆔' },

            // Image Details
            'DateTime': { label: 'Date & Time', category: 'Image Details', icon: '📅' },
            'DateTimeOriginal': { label: 'Original Date', category: 'Image Details', icon: '📅' },
            'DateTimeDigitized': { label: 'Digitized Date', category: 'Image Details', icon: '📅' },
            'ImageDescription': { label: 'Description', category: 'Image Details', icon: '📝' },
            'Orientation': { label: 'Orientation', category: 'Image Details', icon: '🔄' },
            'XResolution': { label: 'X Resolution', category: 'Image Details', icon: '📐' },
            'YResolution': { label: 'Y Resolution', category: 'Image Details', icon: '📐' },
            'ResolutionUnit': { label: 'Resolution Unit', category: 'Image Details', icon: '📐' },
            'ColorSpace': { label: 'Color Space', category: 'Image Details', icon: '🎨' },
            'YCbCrPositioning': { label: 'YCbCr Positioning', category: 'Image Details', icon: '🎨' },

            // Location Data
            'GPSLatitude': { label: 'GPS Latitude', category: 'Location Data', icon: '📍' },
            'GPSLongitude': { label: 'GPS Longitude', category: 'Location Data', icon: '📍' },
            'GPSAltitude': { label: 'GPS Altitude', category: 'Location Data', icon: '🏔️' },
            'GPSTimeStamp': { label: 'GPS Time', category: 'Location Data', icon: '⏰' },
            'GPSDateStamp': { label: 'GPS Date', category: 'Location Data', icon: '📅' },
            'GPSProcessingMethod': { label: 'GPS Processing Method', category: 'Location Data', icon: '🔧' },
            'GPSVersionID': { label: 'GPS Version ID', category: 'Location Data', icon: '🔧' },

            // Technical Data
            'ExposureTime': { label: 'Exposure Time', category: 'Technical Data', icon: '⏱️' },
            'FNumber': { label: 'F-Number', category: 'Technical Data', icon: '🔍' },
            'ISOSpeedRatings': { label: 'ISO Speed', category: 'Technical Data', icon: '📸' },
            'FocalLength': { label: 'Focal Length', category: 'Technical Data', icon: '🔭' },
            'Flash': { label: 'Flash', category: 'Technical Data', icon: '⚡' },
            'WhiteBalance': { label: 'White Balance', category: 'Technical Data', icon: '⚖️' },
            'MeteringMode': { label: 'Metering Mode', category: 'Technical Data', icon: '📊' },
            'ExposureMode': { label: 'Exposure Mode', category: 'Technical Data', icon: '📸' },
            'ExposureProgram': { label: 'Exposure Program', category: 'Technical Data', icon: '📸' },
            'ExposureBiasValue': { label: 'Exposure Bias', category: 'Technical Data', icon: '📊' },
            'MaxApertureValue': { label: 'Max Aperture', category: 'Technical Data', icon: '🔍' },
            'SubjectDistance': { label: 'Subject Distance', category: 'Technical Data', icon: '📏' },
            'LensSpecification': { label: 'Lens Specification', category: 'Technical Data', icon: '🔭' },
            'LensMake': { label: 'Lens Make', category: 'Technical Data', icon: '🔭' },
            'LensModel': { label: 'Lens Model', category: 'Technical Data', icon: '🔭' },
            'ShutterSpeedValue': { label: 'Shutter Speed Value', category: 'Technical Data', icon: '⏱️' },
            'ApertureValue': { label: 'Aperture Value', category: 'Technical Data', icon: '🔍' },
            'BrightnessValue': { label: 'Brightness Value', category: 'Technical Data', icon: '💡' },
            'LightSource': { label: 'Light Source', category: 'Technical Data', icon: '💡' },
            'SceneType': { label: 'Scene Type', category: 'Technical Data', icon: '🎬' },
            'CustomRendered': { label: 'Custom Rendered', category: 'Technical Data', icon: '🎨' },
            'DigitalZoomRatio': { label: 'Digital Zoom Ratio', category: 'Technical Data', icon: '🔍' },
            'FocalLengthIn35mmFilm': { label: 'Focal Length (35mm)', category: 'Technical Data', icon: '🎞️' },
            'SceneCaptureType': { label: 'Scene Capture Type', category: 'Technical Data', icon: '📸' },
            'GainControl': { label: 'Gain Control', category: 'Technical Data', icon: '📊' },
            'Contrast': { label: 'Contrast', category: 'Technical Data', icon: '📊' },
            'Saturation': { label: 'Saturation', category: 'Technical Data', icon: '🎨' },
            'Sharpness': { label: 'Sharpness', category: 'Technical Data', icon: '🔪' },
            'SubjectDistanceRange': { label: 'Subject Distance Range', category: 'Technical Data', icon: '📏' },

            // File Information
            'FileSource': { label: 'File Source', category: 'File Information', icon: '📁' },
            'ComponentsConfiguration': { label: 'Components Configuration', category: 'File Information', icon: '⚙️' },
            'Compression': { label: 'Compression', category: 'File Information', icon: '🗜️' },
            'JPEGInterchangeFormat': { label: 'JPEG Interchange Format', category: 'File Information', icon: '🖼️' },
            'JPEGInterchangeFormatLength': { label: 'JPEG Interchange Format Length', category: 'File Information', icon: '📏' }
        };

        Object.keys(this.exifData).forEach(key => {
            const mapping = mappings[key] || { label: key, category: 'Other', icon: '📋' };
            categories[mapping.category].push({
                key: key,
                label: mapping.label,
                value: this.exifData[key],
                icon: mapping.icon
            });
        });

        // Remove empty categories
        Object.keys(categories).forEach(category => {
            if (categories[category].length === 0) {
                delete categories[category];
            }
        });

        return categories;
    }

    formatEXIFValue(key, value) {
        if (value === undefined || value === null) {
            return '<em>Not available</em>';
        }

        // Handle GPS coordinates with link and map preview
        if (key === 'GPSLatitude' && this.exifData.GPSLongitude) {
            const lat = this.formatGPSValue(value);
            const lng = this.formatGPSValue(this.exifData.GPSLongitude);
            const url = `https://www.google.com/maps?q=${lat},${lng}`;
            const mapPreview = this.createGPSMapPreview(lat, lng);
            return `${lat} <a href="${url}" target="_blank" class="gps-link">📍 View on Map</a>${mapPreview}`;
        }

        if (key === 'GPSLongitude' && this.exifData.GPSLatitude) {
            const lng = this.formatGPSValue(value);
            const lat = this.formatGPSValue(this.exifData.GPSLatitude);
            const url = `https://www.google.com/maps?q=${lat},${lng}`;
            const mapPreview = this.createGPSMapPreview(lat, lng);
            return `${lng} <a href="${url}" target="_blank" class="gps-link">📍 View on Map</a>${mapPreview}`;
        }

        // Handle other GPS coordinates
        if (key === 'GPSLatitude' || key === 'GPSLongitude') {
            return this.formatGPSValue(value);
        }

        // Handle orientation
        if (key === 'Orientation') {
            const orientations = {
                1: 'Normal',
                2: 'Mirror horizontal',
                3: 'Rotate 180°',
                4: 'Mirror vertical',
                5: 'Mirror horizontal and rotate 270° CW',
                6: 'Rotate 90° CW',
                7: 'Mirror horizontal and rotate 90° CW',
                8: 'Rotate 270° CW'
            };
            return orientations[value] || value;
        }

        // Handle flash
        if (key === 'Flash') {
            return this.formatFlashValue(value);
        }

        // Handle exposure time
        if (key === 'ExposureTime') {
            if (typeof value === 'number') {
                return `${value} seconds`;
            }
            return value;
        }

        // Handle focal length
        if (key === 'FocalLength') {
            if (typeof value === 'number') {
                return `${value}mm`;
            }
            return value;
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.join(', ');
        }

        // Handle objects
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        return value.toString();
    }

    formatGPSValue(value) {
        if (Array.isArray(value)) {
            const degrees = value[0];
            const minutes = value[1];
            const seconds = value[2];
            return `${degrees}° ${minutes}' ${seconds}"`;
        }
        return value;
    }

    createGPSMapPreview(lat, lng) {
        // Convert GPS coordinates to decimal format for map preview
        const latDecimal = this.convertGPSToDecimal(lat);
        const lngDecimal = this.convertGPSToDecimal(lng);
        
        if (latDecimal && lngDecimal) {
            return `
                <div class="gps-map-preview">
                    <iframe 
                        width="100%" 
                        height="200" 
                        frameborder="0" 
                        scrolling="no" 
                        marginheight="0" 
                        marginwidth="0"
                        src="https://maps.google.com/maps?q=${latDecimal},${lngDecimal}&hl=en&z=15&output=embed">
                    </iframe>
                </div>
            `;
        }
        return '';
    }

    convertGPSToDecimal(gpsString) {
        // Convert GPS format (e.g., "40° 42' 51.6"") to decimal
        const match = gpsString.match(/(\d+)°\s*(\d+)'\s*([\d.]+)"/);
        if (match) {
            const degrees = parseFloat(match[1]);
            const minutes = parseFloat(match[2]);
            const seconds = parseFloat(match[3]);
            return degrees + (minutes / 60) + (seconds / 3600);
        }
        return null;
    }

    formatFlashValue(value) {
        const flashValues = {
            0: 'No flash',
            1: 'Fired',
            5: 'Fired, return not detected',
            7: 'Fired, return detected',
            8: 'On, did not fire',
            9: 'On, fired',
            13: 'On, return not detected',
            15: 'On, return detected',
            16: 'Off, did not fire',
            24: 'Auto, did not fire',
            25: 'Auto, fired',
            29: 'Auto, fired, return not detected',
            31: 'Auto, fired, return detected',
            32: 'No flash function',
            65: 'Fired, red-eye reduction',
            69: 'Fired, red-eye reduction, return not detected',
            71: 'Fired, red-eye reduction, return detected',
            73: 'On, red-eye reduction',
            77: 'On, red-eye reduction, return not detected',
            79: 'On, red-eye reduction, return detected',
            89: 'Auto, fired, red-eye reduction',
            93: 'Auto, fired, red-eye reduction, return not detected',
            95: 'Auto, fired, red-eye reduction, return detected'
        };
        return flashValues[value] || value;
    }

    showContentArea() {
        this.contentArea.style.display = 'block';
        this.contentArea.scrollIntoView({ behavior: 'smooth' });
    }

    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Add new message to body for better visibility
        document.body.appendChild(messageDiv);
        
        // Auto remove after appropriate time based on type
        const timeout = type === 'error' ? 8000 : type === 'info' ? 3000 : 5000;
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, timeout);
    }

    resetApp() {
        this.currentFile = null;
        this.currentImage = null;
        this.exifData = null;
        this.cleanImageData = null;
        this.originalImageData = null;
        
        // Clear file input
        this.fileInput.value = '';
        
        // Hide content area
        this.contentArea.style.display = 'none';
        
        // Reset buttons
        this.removeExifBtn.disabled = true;
        this.downloadBtn.disabled = true;
        this.disableEnhancedButtons();
        
        // Hide all enhanced containers
        this.hideProgress();
        this.hideImageZoom();
        this.hideComparison();
        this.hideSelectiveExif();
        this.hideExportOptions();
        
        // Clear any messages
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());
        
        // Reset image preview
        if (this.imagePreview) {
            this.imagePreview.src = '';
            this.imagePreview.alt = '';
        }
        
        // Reset file info
        if (this.fileName) this.fileName.textContent = '';
        if (this.fileSize) this.fileSize.textContent = '';
        if (this.imageDimensions) this.imageDimensions.textContent = '';
        
        // Reset metadata content
        if (this.metadataContent) {
            this.metadataContent.innerHTML = '<div class="no-metadata"><p>No EXIF metadata found in this image.</p></div>';
        }

        // Track reset event
        this.analytics.track('app_reset');
    }

    // EXIF removal functionality
    removeEXIFData() {
        if (!this.currentImage) {
            this.showMessage('No image loaded', 'error');
            return;
        }

        try {
            this.showMessage('Removing EXIF data...', 'info');
            this.exifStripper.removeEXIFData();
        } catch (error) {
            console.error('Error removing EXIF data:', error);
            this.showMessage('Error removing EXIF data. Please try again.', 'error');
        }
    }

    downloadCleanImage() {
        if (!this.cleanImageData) {
            this.showMessage('No clean image available. Please remove EXIF data first.', 'error');
            return;
        }

        try {
            this.exifStripper.downloadCleanImage();
        } catch (error) {
            console.error('Error downloading image:', error);
            this.showMessage('Error downloading image. Please try again.', 'error');
        }
    }

    // Method to manually enable buttons for testing
    enableButtonsForTesting() {
        console.log('Manually enabling buttons for testing...');
        this.removeExifBtn.disabled = false;
        this.downloadBtn.disabled = false;
        console.log('Buttons enabled - Remove:', !this.removeExifBtn.disabled, 'Download:', !this.downloadBtn.disabled);
    }

    // Enhanced functionality methods
    initializeProgressIndicator() {
        // Progress container is already in HTML
        console.log('Progress indicator initialized');
    }

    initializeImagePreview() {
        // Image zoom container is already in HTML
        this.setupZoomControls();
    }

    initializePWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
        }
    }

    setupZoomControls() {
        const zoomBtns = this.imageZoomContainer.querySelectorAll('.zoom-btn');
        zoomBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleZoomAction(action);
            });
        });
    }

    handleZoomAction(action) {
        const zoomImage = this.imageZoomContainer.querySelector('#zoom-image');
        const zoomLevel = this.imageZoomContainer.querySelector('.zoom-level');
        
        if (!zoomImage) return;

        let currentZoom = parseFloat(zoomLevel.textContent) || 100;

        switch (action) {
            case 'zoom-in':
                currentZoom = Math.min(currentZoom * 1.2, 500);
                break;
            case 'zoom-out':
                currentZoom = Math.max(currentZoom / 1.2, 25);
                break;
            case 'zoom-reset':
                currentZoom = 100;
                break;
        }

        zoomImage.style.transform = `scale(${currentZoom / 100})`;
        zoomLevel.textContent = `${Math.round(currentZoom)}%`;
    }

    showProgress(message, progress = 0) {
        this.progressContainer.style.display = 'block';
        this.progressContainer.querySelector('.progress-text').textContent = message;
        this.progressContainer.querySelector('.progress-fill').style.width = `${progress}%`;
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
    }

    showImageZoom(imageSrc) {
        const zoomImage = this.imageZoomContainer.querySelector('#zoom-image');
        zoomImage.src = imageSrc;
        this.imageZoomContainer.style.display = 'block';
    }

    hideImageZoom() {
        this.imageZoomContainer.style.display = 'none';
    }

    showComparison(originalSrc, cleanedSrc) {
        const beforeImg = this.comparisonContainer.querySelector('#comparison-before-img');
        const afterImg = this.comparisonContainer.querySelector('#comparison-after-img');
        
        beforeImg.src = originalSrc;
        afterImg.src = cleanedSrc;
        this.comparisonContainer.style.display = 'block';
    }

    hideComparison() {
        this.comparisonContainer.style.display = 'none';
    }

    showSelectiveExif() {
        this.populateExifCheckboxes();
        this.selectiveExifContainer.style.display = 'block';
    }

    hideSelectiveExif() {
        this.selectiveExifContainer.style.display = 'none';
    }

    populateExifCheckboxes() {
        if (!this.exifData) return;

        const categories = {
            'camera': ['Make', 'Model', 'Software', 'Artist', 'Copyright'],
            'location': ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSTimeStamp'],
            'technical': ['ExposureTime', 'FNumber', 'ISOSpeedRatings', 'FocalLength', 'Flash']
        };

        Object.keys(categories).forEach(category => {
            const container = document.getElementById(`${category}-checkboxes`);
            container.innerHTML = '';

            categories[category].forEach(field => {
                if (this.exifData[field] !== undefined) {
                    const checkbox = document.createElement('div');
                    checkbox.className = 'exif-checkbox-item';
                    checkbox.innerHTML = `
                        <input type="checkbox" id="exif-${field}" value="${field}" checked>
                        <label for="exif-${field}">${field}</label>
                    `;
                    container.appendChild(checkbox);
                }
            });
        });
    }

    showExportOptions() {
        this.exportContainer.style.display = 'block';
    }

    hideExportOptions() {
        this.exportContainer.style.display = 'none';
    }

    exportEXIFAsJSON() {
        if (!this.exifData) return;

        const dataStr = JSON.stringify(this.exifData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'exif-data.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }

    exportEXIFAsCSV() {
        if (!this.exifData) return;

        const headers = ['Field', 'Value'];
        const rows = Object.entries(this.exifData).map(([key, value]) => [key, value]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        
        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'exif-data.csv';
        link.click();
        
        URL.revokeObjectURL(url);
    }

    copyEXIFToClipboard() {
        if (!this.exifData) return;

        const text = Object.entries(this.exifData)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        
        navigator.clipboard.writeText(text).then(() => {
            this.showMessage('EXIF data copied to clipboard!', 'success');
        });
    }

    // Event binding methods for enhanced features
    bindExportEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'export-json-btn') {
                this.exportEXIFAsJSON();
                this.hideExportOptions();
            } else if (e.target.id === 'export-csv-btn') {
                this.exportEXIFAsCSV();
                this.hideExportOptions();
            } else if (e.target.id === 'copy-clipboard-btn') {
                this.copyEXIFToClipboard();
                this.hideExportOptions();
            } else if (e.target.id === 'close-export') {
                this.hideExportOptions();
            }
        });
    }

    bindSelectiveExifEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'apply-selective-btn') {
                this.applySelectiveRemoval();
            } else if (e.target.id === 'select-all-btn') {
                this.selectAllExifFields();
            } else if (e.target.id === 'deselect-all-btn') {
                this.deselectAllExifFields();
            } else if (e.target.id === 'close-selective') {
                this.hideSelectiveExif();
            }
        });
    }

    bindComparisonEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'close-comparison') {
                this.hideComparison();
            } else if (e.target.id === 'close-zoom') {
                this.hideImageZoom();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideComparison();
                this.hideImageZoom();
                this.hideSelectiveExif();
                this.hideExportOptions();
            }
        });
    }

    applySelectiveRemoval() {
        const checkboxes = this.selectiveExifContainer.querySelectorAll('input[type="checkbox"]:checked');
        const selectedFields = Array.from(checkboxes).map(cb => cb.value);
        
        if (selectedFields.length === 0) {
            this.showMessage('Please select at least one EXIF field to remove', 'error');
            return;
        }

        this.hideSelectiveExif();
        this.exifStripper.removeSelectiveEXIF(selectedFields);
    }

    selectAllExifFields() {
        const checkboxes = this.selectiveExifContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = true);
    }

    deselectAllExifFields() {
        const checkboxes = this.selectiveExifContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    }

    enableEnhancedButtons() {
        const selectiveExifBtn = document.getElementById('selective-exif-btn');
        const exportExifBtn = document.getElementById('export-exif-btn');
        const zoomBtn = document.getElementById('zoom-btn');

        if (selectiveExifBtn) selectiveExifBtn.disabled = false;
        if (exportExifBtn) exportExifBtn.disabled = false;
        if (zoomBtn) zoomBtn.disabled = false;
    }

    disableEnhancedButtons() {
        const selectiveExifBtn = document.getElementById('selective-exif-btn');
        const exportExifBtn = document.getElementById('export-exif-btn');
        const zoomBtn = document.getElementById('zoom-btn');

        if (selectiveExifBtn) selectiveExifBtn.disabled = true;
        if (exportExifBtn) exportExifBtn.disabled = true;
        if (zoomBtn) zoomBtn.disabled = true;
    }
}

// Analytics Tracker
class AnalyticsTracker {
    constructor() {
        this.events = [];
        this.startTime = Date.now();
    }

    track(event, data = {}) {
        this.events.push({
            event,
            data,
            timestamp: Date.now(),
            sessionTime: Date.now() - this.startTime
        });
        console.log(`Analytics: ${event}`, data);
    }

    getSessionData() {
        return {
            duration: Date.now() - this.startTime,
            events: this.events,
            eventCount: this.events.length
        };
    }
}

// EXIF Stripping and Image Processing
class EXIFStripper {
    constructor(exifViewer) {
        this.exifViewer = exifViewer;
        this.canvas = null;
        this.ctx = null;
        this.selectedFields = new Set();
    }

    // Remove EXIF data from image using canvas
    removeEXIFData(selectiveFields = null) {
        if (!this.exifViewer.currentImage) {
            this.exifViewer.showMessage('No image loaded', 'error');
            return;
        }

        try {
            this.exifViewer.showProgress('Removing EXIF data...', 0);
            this.exifViewer.analytics.track('exif_removal_started', { selective: !!selectiveFields });
            
            // Store original image data for comparison
            this.exifViewer.originalImageData = this.exifViewer.currentImage.src;
            
            this.createCleanImage(selectiveFields);
            
            this.exifViewer.showProgress('EXIF data removed successfully!', 100);
            setTimeout(() => {
                this.exifViewer.hideProgress();
                this.exifViewer.showMessage('EXIF data removed successfully! You can now download the clean image.', 'success');
                this.exifViewer.downloadBtn.disabled = false;
                this.exifViewer.analytics.track('exif_removal_completed');
            }, 500);
        } catch (error) {
            console.error('Error removing EXIF data:', error);
            this.exifViewer.hideProgress();
            this.exifViewer.showMessage('Error removing EXIF data. Please try again.', 'error');
            this.exifViewer.analytics.track('exif_removal_failed', { error: error.message });
        }
    }

    createCleanImage(selectiveFields = null) {
        const img = this.exifViewer.currentImage;
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas dimensions
        this.canvas.width = img.naturalWidth;
        this.canvas.height = img.naturalHeight;

        // Apply orientation correction if needed
        this.applyOrientationCorrection(img);

        // Draw the image on canvas (this strips all metadata)
        this.ctx.drawImage(img, 0, 0);

        // Store the clean image data
        this.exifViewer.cleanImageData = this.canvas.toDataURL(
            this.getImageMimeType(this.exifViewer.currentFile),
            0.95 // Quality for JPEG
        );

        // Show comparison if both original and clean images exist
        if (this.exifViewer.originalImageData && this.exifViewer.cleanImageData) {
            setTimeout(() => {
                this.exifViewer.showComparison(this.exifViewer.originalImageData, this.exifViewer.cleanImageData);
            }, 1000);
        }
    }

    // Selective EXIF removal (for future enhancement)
    removeSelectiveEXIF(selectedFields) {
        this.selectedFields = new Set(selectedFields);
        this.removeEXIFData(selectedFields);
    }

    applyOrientationCorrection(img) {
        if (!this.exifViewer.exifData || !this.exifViewer.exifData.Orientation) {
            return;
        }

        const orientation = this.exifViewer.exifData.Orientation;
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // Reset canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply transformations based on orientation
        switch (orientation) {
            case 2: // Mirror horizontal
                this.ctx.transform(-1, 0, 0, 1, width, 0);
                break;
            case 3: // Rotate 180°
                this.ctx.transform(-1, 0, 0, -1, width, height);
                break;
            case 4: // Mirror vertical
                this.ctx.transform(1, 0, 0, -1, 0, height);
                break;
            case 5: // Mirror horizontal and rotate 270° CW
                this.ctx.transform(0, -1, -1, 0, height, width);
                break;
            case 6: // Rotate 90° CW
                this.ctx.transform(0, 1, -1, 0, height, 0);
                break;
            case 7: // Mirror horizontal and rotate 90° CW
                this.ctx.transform(0, 1, 1, 0, 0, 0);
                break;
            case 8: // Rotate 270° CW
                this.ctx.transform(0, -1, 1, 0, 0, width);
                break;
            default:
                // No transformation needed
                break;
        }
    }

    getImageMimeType(file) {
        const mimeTypes = {
            'image/jpeg': 'image/jpeg',
            'image/jpg': 'image/jpeg',
            'image/png': 'image/png',
            'image/webp': 'image/webp',
            'image/bmp': 'image/png' // Convert BMP to PNG for better compatibility
        };
        return mimeTypes[file.type] || 'image/jpeg';
    }

    getFileExtension(file) {
        const extensions = {
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/bmp': '.png' // Convert BMP to PNG
        };
        return extensions[file.type] || '.jpg';
    }

    // Download the clean image
    downloadCleanImage() {
        if (!this.exifViewer.cleanImageData) {
            this.exifViewer.showMessage('No clean image available. Please remove EXIF data first.', 'error');
            return;
        }

        try {
            // Create download link
            const link = document.createElement('a');
            link.href = this.exifViewer.cleanImageData;
            
            // Generate filename
            const originalName = this.exifViewer.currentFile.name;
            const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
            const extension = this.getFileExtension(this.exifViewer.currentFile);
            const cleanName = `${nameWithoutExt}_clean${extension}`;
            
            link.download = cleanName;
            link.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.exifViewer.showMessage('Clean image downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading image:', error);
            this.exifViewer.showMessage('Error downloading image. Please try again.', 'error');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired - initializing EXIFViewer...');
    try {
        window.exifViewer = new EXIFViewer();
        console.log('EXIFViewer initialized successfully:', window.exifViewer);
    } catch (error) {
        console.error('Failed to initialize EXIFViewer:', error);
    }
});

// Also try to initialize when window loads (in case DOMContentLoaded already fired)
window.addEventListener('load', () => {
    console.log('Window load event fired - checking EXIFViewer...');
    if (!window.exifViewer) {
        console.log('EXIFViewer not found, trying to initialize...');
        try {
            window.exifViewer = new EXIFViewer();
            console.log('EXIFViewer initialized on window load:', window.exifViewer);
        } catch (error) {
            console.error('Failed to initialize EXIFViewer on window load:', error);
        }
    } else {
        console.log('EXIFViewer already exists:', window.exifViewer);
    }
});

// Immediate initialization if DOM is already ready
if (document.readyState !== 'loading') {
    console.log('DOM already ready, initializing EXIFViewer immediately...');
    try {
        window.exifViewer = new EXIFViewer();
        console.log('EXIFViewer initialized immediately:', window.exifViewer);
    } catch (error) {
        console.error('Failed to initialize EXIFViewer immediately:', error);
    }
}

// Also try to initialize after a short delay to ensure everything is loaded
setTimeout(() => {
    if (!window.exifViewer) {
        console.log('Delayed initialization attempt...');
        try {
            window.exifViewer = new EXIFViewer();
            console.log('EXIFViewer initialized with delay:', window.exifViewer);
        } catch (error) {
            console.error('Failed to initialize EXIFViewer with delay:', error);
        }
    }
}, 500);

// Check for EXIF library availability and reinitialize if needed
setTimeout(() => {
    if (typeof EXIF !== 'undefined' && window.exifViewer) {
        console.log('EXIF library is available, checking functionality...');
        // Test if EXIF functionality works
        if (window.exifViewer.uploadBtn) {
            console.log('✅ Upload button found and ready');
        } else {
            console.log('❌ Upload button not found');
        }
    } else if (typeof EXIF === 'undefined') {
        console.error('❌ EXIF library not loaded after 2 seconds');
    }
}, 2000);