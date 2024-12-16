class SettingsManager {
    constructor(controls) {
        this.controls = controls;
        this.setupEventListeners();
        this.loadDefaultSettings();
    }

    setupEventListeners() {
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('loadSettings').addEventListener('click', () => this.loadSettings());
        
        // Add change listener for settings list dropdown
        const settingsList = document.getElementById('savedSettingsList');
        if (settingsList) {
            settingsList.addEventListener('change', () => {
                if (settingsList.value) {
                    this.loadSettingsByName(settingsList.value);
                }
            });
        }
    }

    loadSettingsByName(name) {
        // This would be used if we had server-side storage
        // For now, we'll just show a notification
        this.showNotification('Loading settings from file is currently supported', 'info');
    }

    async saveSettings() {
        try {
            const settingsName = document.getElementById('settingsName').value || 'settings';
            const jsonFilename = `${settingsName}.json`;
            const imageFilename = `${settingsName}.jpg`;
            
            // Create thumbnail
            const canvas = document.getElementById('particleCanvas');
            const thumbnailCanvas = document.createElement('canvas');
            const thumbSize = 500;
            thumbnailCanvas.width = thumbSize;
            thumbnailCanvas.height = thumbSize;
            
            // Calculate center crop coordinates
            const centerX = Math.max(0, (canvas.width - thumbSize) / 2);
            const centerY = Math.max(0, (canvas.height - thumbSize) / 2);
            
            // Get the context and set background
            const ctx = thumbnailCanvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, thumbSize, thumbSize);
            
            // Draw cropped and scaled version
            ctx.drawImage(canvas, 
                centerX, centerY, thumbSize, thumbSize,  // source coords and size
                0, 0, thumbSize, thumbSize               // dest coords and size
            );
            
            // Save thumbnail as separate file
            thumbnailCanvas.toBlob(async (blob) => {
                const imageUrl = URL.createObjectURL(blob);
                const imageLink = document.createElement('a');
                imageLink.href = imageUrl;
                imageLink.download = imageFilename;
                document.body.appendChild(imageLink);
                imageLink.click();
                document.body.removeChild(imageLink);
                URL.revokeObjectURL(imageUrl);
            }, 'image/jpeg', 0.9);
            
            // Convert thumbnail to base64 for JSON
            const thumbnailData = thumbnailCanvas.toDataURL('image/jpeg', 0.9);
            
            // Collect all current settings
            const settings = {
                ...CONFIG,
                timestamp: new Date().toISOString(),
                name: settingsName,
                thumbnail: thumbnailData
            };

            // Save JSON file
            const jsonBlob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const jsonLink = document.createElement('a');
            jsonLink.href = jsonUrl;
            jsonLink.download = jsonFilename;
            document.body.appendChild(jsonLink);
            jsonLink.click();
            document.body.removeChild(jsonLink);
            URL.revokeObjectURL(jsonUrl);

            // Update UI
            this.addSettingToList(settingsName);
            this.displayThumbnail(thumbnailData);
            this.showNotification('Settings and thumbnail saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }

    addSettingToList(name) {
        const settingsList = document.getElementById('savedSettingsList');
        let found = false;
        
        // Check if setting already exists in list
        for (let i = 0; i < settingsList.options.length; i++) {
            if (settingsList.options[i].value === name) {
                found = true;
                break;
            }
        }
        
        // Add new option if not found
        if (!found) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            settingsList.appendChild(option);
        }
    }

    loadSettings() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.addEventListener('change', async (e) => {
            try {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const settings = JSON.parse(event.target.result);
                        this.applySettings(settings);
                        this.addSettingToList(settings.name);
                        if (settings.thumbnail) {
                            this.displayThumbnail(settings.thumbnail);
                        }
                        this.showNotification('Settings loaded successfully!', 'success');
                    } catch (error) {
                        console.error('Error parsing settings file:', error);
                        this.showNotification('Invalid settings file', 'error');
                    }
                };
                reader.readAsText(file);
            } catch (error) {
                console.error('Error loading settings:', error);
                this.showNotification('Error loading settings', 'error');
            }
        });

        fileInput.click();
    }

    applySettings(settings) {
        console.log('Applying settings:', settings);
        
        // First, update CONFIG object
        this.updateConfigFromSettings(settings);
        
        // Then update UI
        this.updateUIControls(settings);
        
        // Trigger global update event
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
        
        // Add a small delay to ensure all settings are applied before reset
        setTimeout(() => {
            // Force pattern refresh and particle reset
            if (window.renderer) {
                // If pattern visualizer exists, update it first
                if (window.renderer.patternVisualizer) {
                    window.renderer.patternVisualizer.generatePatternPoints();
                }
                
                // Then reset all particles with new settings
                window.renderer.initParticles();
                
                console.log('Pattern and particles reset after settings load');
            }
        }, 100); // Small delay to ensure settings are fully applied
    }

    updateConfigFromSettings(settings) {
        // Handle both flat and grouped settings formats
        if (settings.particle) {
            // New grouped format
            Object.assign(CONFIG, {
                ...settings.particle,
                ...settings.movement,
                ...settings.connections,
                ...settings.forces,
                ...settings.pattern,
                ...settings.mandelbrot,
                ...settings.visualModes
            });
        } else {
            // Old flat format
            Object.keys(settings).forEach(key => {
                if (key in CONFIG) {
                    CONFIG[key] = settings[key];
                }
            });
        }
    }

    updateUIControls(settings) {
        console.log('Updating UI with settings:', settings);
        
        // Scale factors for certain values
        const scaleFactors = {
            attractionStrength: 100,  // 0.04 -> 4
            repulsionStrength: 100,   // 0.02 -> 2
            fadeSpeed: 10000,         // 0.0001 -> 1
            connectionFadeSpeed: 1000  // 0.001 -> 1
        };
        
        // Update all UI elements
        Object.keys(CONFIG).forEach(key => {
            const element = document.getElementById(key);
            const valueElement = document.getElementById(`${key}Value`);
            
            if (element) {
                let value = settings[key] !== undefined ? settings[key] : CONFIG[key];
                
                // Scale up values for slider display if needed
                if (scaleFactors[key]) {
                    value = value * scaleFactors[key];
                }
                
                if (element.type === 'checkbox') {
                    element.checked = value;
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                } else if (element.type === 'range' || element.type === 'number') {
                    element.value = value;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                } else if (element.type === 'color') {
                    element.value = value;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                } else if (element.tagName === 'SELECT') {
                    element.value = value;
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                // Update value display
                if (valueElement) {
                    valueElement.textContent = value;
                }
            }
        });

        // Update color pickers and their opacities
        ['particle', 'line', 'dot'].forEach(type => {
            const colorPicker = document.getElementById(`${type}ColorPicker`);
            const opacityPicker = document.getElementById(`${type}OpacityPicker`);
            
            if (colorPicker && settings[`${type}Color`]) {
                colorPicker.value = settings[`${type}Color`];
                colorPicker.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            if (opacityPicker && settings[`${type}Opacity`] !== undefined) {
                opacityPicker.value = settings[`${type}Opacity`];
                opacityPicker.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        // Trigger global update
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
    }

    flattenSettings(settings) {
        const flat = {};
        
        function flatten(obj, prefix = '') {
            Object.entries(obj).forEach(([key, value]) => {
                if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                    flatten(value, `${prefix}${key}.`);
                } else {
                    flat[`${prefix}${key}`] = value;
                }
            });
        }
        
        flatten(settings);
        return flat;
    }

    triggerPatternRefresh(settings) {
        // This method is now handled in applySettings
        // Keeping for backward compatibility
        if (window.renderer) {
            window.renderer.initParticles();
        }
    }

    showNotification(message, type = 'info') {
        let notification = document.getElementById('settings-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'settings-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `settings-notification ${type}`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    async loadDefaultSettings() {
        const startTime = performance.now();
        console.log(`[Settings] Environment: ${process.env.NODE_ENV}`);
        console.log('[Settings] Starting to load default settings...');
        
        try {
            const settingsUrl = '/settings/default-settings.json';
            console.log(`[Settings] Fetching from: ${settingsUrl}`);
            
            const response = await fetch(settingsUrl, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            console.log(`[Settings] Response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            console.log(`[Settings] Received ${text.length} bytes`);
            
            const settings = JSON.parse(text);
            console.log('[Settings] Parsed settings:', settings);
            
            await this.applySettings(settings);
            
            const endTime = performance.now();
            console.log(`[Settings] Settings applied in ${(endTime - startTime).toFixed(2)}ms`);
            
            // Verify settings were applied
            console.log('[Settings] Current CONFIG:', CONFIG);
        } catch (error) {
            console.error('[Settings] Error:', error);
            console.log('[Settings] Using default CONFIG');
        }
    }

    // Add method to display thumbnail when loading settings
    displayThumbnail(thumbnailData) {
        const thumbnail = document.createElement('img');
        thumbnail.src = thumbnailData;
        thumbnail.style.width = '100px';
        thumbnail.style.height = '100px';
        thumbnail.style.objectFit = 'cover';
        thumbnail.style.borderRadius = '4px';
        thumbnail.style.marginTop = '10px';
        
        const container = document.getElementById('settingsThumbnail') || document.createElement('div');
        container.id = 'settingsThumbnail';
        container.innerHTML = '';
        container.appendChild(thumbnail);
        
        const settingsButtons = document.querySelector('.settings-buttons');
        if (!document.getElementById('settingsThumbnail')) {
            settingsButtons.appendChild(container);
        }
    }
}
