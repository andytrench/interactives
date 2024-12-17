class SettingsManager {
    constructor(controls) {
        this.controls = controls;
        console.log('SettingsManager constructor called');
        this.setupEventListeners();
        this.loadDefaultSettings();
        console.log('Loading example presets...');
        this.loadExamplePresets();
        this.setupPresetListeners();
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

    setupPresetListeners() {
        const presetItems = document.querySelectorAll('.preset-item');
        presetItems.forEach(item => {
            item.addEventListener('click', async () => {
                const presetName = item.dataset.preset;
                try {
                    console.log(`Loading preset: ${presetName}`);
                    
                    // Remove active class from all presets
                    presetItems.forEach(p => p.classList.remove('active'));
                    
                    // Add active class to clicked preset
                    item.classList.add('active');
                    
                    // Load the preset settings file
                    const response = await fetch(`/examples/${presetName}.json`);
                    if (!response.ok) throw new Error('Failed to load preset');
                    
                    const settings = await response.json();
                    await this.applySettings(settings);
                    
                    this.showNotification(`Loaded ${presetName} preset`, 'success');
                } catch (error) {
                    console.error('Error loading preset:', error);
                    this.showNotification(`Failed to load ${presetName} preset`, 'error');
                }
            });
        });
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
            
            // Create complete settings object
            const settings = {
                // Particle Properties
                particleCount: CONFIG.particleCount,
                particleSize: CONFIG.particleSize,
                fadeSpeed: CONFIG.fadeSpeed,
                maxTravelDistance: CONFIG.maxTravelDistance,
                travelSpeed: CONFIG.travelSpeed,
                momentum: CONFIG.momentum,
                friction: CONFIG.friction,

                // Connection Properties
                connectionDistance: CONFIG.connectionDistance,
                lineThickness: CONFIG.lineThickness,
                connectionFadeSpeed: CONFIG.connectionFadeSpeed,

                // Forces
                attractionStrength: CONFIG.attractionStrength,
                attractionDistance: CONFIG.attractionDistance,
                repulsionStrength: CONFIG.repulsionStrength,

                // Mandelbrot
                maxIterations: CONFIG.maxIterations,
                zoom: CONFIG.zoom,
                seahorseX: CONFIG.seahorseX,
                seahorseY: CONFIG.seahorseY,

                // Visual Modes
                fullMatrixMode: CONFIG.fullMatrixMode,
                colorfulMode: CONFIG.colorfulMode,
                persistentConnections: CONFIG.persistentConnections,
                particlesOnTop: CONFIG.particlesOnTop,

                // Colors
                particleColor: CONFIG.particleColor,
                particleOpacity: CONFIG.particleOpacity,
                lineColor: CONFIG.lineColor,
                lineOpacity: CONFIG.lineOpacity,
                dotColor: CONFIG.dotColor,
                dotOpacity: CONFIG.dotOpacity,

                // Pattern Generator
                pattern: CONFIG.pattern,
                patternScale: CONFIG.patternScale,
                patternDistance: CONFIG.patternDistance,

                // Visual Settings
                glowIntensity: CONFIG.glowIntensity,
                minOpacity: CONFIG.minOpacity,
                maxOpacity: CONFIG.maxOpacity,

                // Particle Lifecycle
                particleSpawnRate: CONFIG.particleSpawnRate,
                minParticleLife: CONFIG.minParticleLife,
                maxParticleLife: CONFIG.maxParticleLife,
                fadeInDuration: CONFIG.fadeInDuration,
                fadeOutDuration: CONFIG.fadeOutDuration,

                // Metadata
                timestamp: new Date().toISOString(),
                name: settingsName,
            };

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
                centerX, centerY, thumbSize, thumbSize,
                0, 0, thumbSize, thumbSize
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
            this.displayThumbnail(thumbnailCanvas.toDataURL('image/jpeg', 0.9));
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

    async applySettings(settings) {
        console.log('Applying settings:', settings);
        
        // Define all possible parameters to ensure complete loading
        const allParameters = {
            // Particle Properties
            particleCount: true,
            particleSize: true,
            fadeSpeed: true,
            maxTravelDistance: true,
            travelSpeed: true,
            momentum: true,
            friction: true,

            // Connection Properties
            connectionDistance: true,
            lineThickness: true,
            connectionFadeSpeed: true,

            // Forces
            attractionStrength: true,
            attractionDistance: true,
            repulsionStrength: true,

            // Mandelbrot
            maxIterations: true,
            zoom: true,
            seahorseX: true,
            seahorseY: true,

            // Visual Modes
            fullMatrixMode: true,
            colorfulMode: true,
            persistentConnections: true,
            particlesOnTop: true,

            // Colors
            particleColor: true,
            particleOpacity: true,
            lineColor: true,
            lineOpacity: true,
            dotColor: true,
            dotOpacity: true,

            // Pattern Generator
            pattern: true,
            patternScale: true,
            patternDistance: true,

            // Visual Settings
            glowIntensity: true,
            minOpacity: true,
            maxOpacity: true,

            // Particle Lifecycle
            particleSpawnRate: true,
            minParticleLife: true,
            maxParticleLife: true,
            fadeInDuration: true,
            fadeOutDuration: true
        };

        // Log any missing parameters
        Object.keys(allParameters).forEach(param => {
            if (settings[param] === undefined) {
                console.warn(`Missing parameter in settings: ${param}, using default value: ${CONFIG[param]}`);
            }
        });

        // First, update CONFIG object
        Object.keys(allParameters).forEach(param => {
            if (settings[param] !== undefined) {
                // Special handling for momentum to ensure it doesn't exceed max
                if (param === 'momentum') {
                    CONFIG[param] = Math.min(parseFloat(settings[param]), 1.001);
                } else if (param === 'attractionStrength' || param === 'repulsionStrength') {
                    CONFIG[param] = settings[param];
                } else {
                    CONFIG[param] = settings[param];
                }
                console.log(`Set ${param} to:`, CONFIG[param]);
            }
        });
        
        // Then update UI
        this.updateUIControls(settings);
        
        // Dispatch event for any other components that need to update
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
    }

    async resetPatternWithRetry(maxAttempts = 3, delay = 500) {
        console.log('Attempting pattern reset...');
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            if (window.renderer) {
                try {
                    console.log(`Pattern reset attempt ${attempt}`);
                    
                    // Wait for a short delay
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    // Reset pattern visualizer
                    window.renderer.patternVisualizer.generatePatternPoints();
                    
                    // Clear existing particles
                    window.renderer.particles = [];
                    
                    // Create new particles with updated settings
                    for (let i = 0; i < CONFIG.particleCount; i++) {
                        window.renderer.createParticle();
                    }
                    
                    console.log('Pattern reset successful');
                    return true;
                } catch (error) {
                    console.error(`Pattern reset attempt ${attempt} failed:`, error);
                    if (attempt === maxAttempts) {
                        console.error('Pattern reset failed after all attempts');
                        return false;
                    }
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return false;
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
        
        // First, ensure all CONFIG values are updated
        Object.keys(settings).forEach(key => {
            if (key in CONFIG) {
                // Special handling for different types of values
                if (key === 'fadeSpeed') {
                    CONFIG[key] = parseFloat(settings[key].toFixed(4));
                } else if (key === 'attractionStrength' || key === 'repulsionStrength') {
                    CONFIG[key] = settings[key];
                } else {
                    CONFIG[key] = settings[key];
                }
                console.log(`Updated CONFIG.${key} to:`, CONFIG[key]);
            }
        });
        
        // Then update all UI elements
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            const valueElement = document.getElementById(`${key}Value`);
            
            if (element) {
                let value = settings[key];
                // Special handling for attraction and repulsion strength UI values
                if (key === 'attractionStrength' || key === 'repulsionStrength') {
                    value = value * 100; // Convert back to UI range
                }
                
                console.log(`Updating UI element ${key} to:`, value);
                
                if (element.type === 'checkbox') {
                    element.checked = value;
                    element.dispatchEvent(new Event('change'));
                } else if (element.type === 'range' || element.type === 'number') {
                    element.value = value;
                    element.dispatchEvent(new Event('input'));
                } else if (element.type === 'color') {
                    element.value = value;
                    element.dispatchEvent(new Event('input'));
                } else if (element.tagName === 'SELECT') {
                    element.value = value;
                    element.dispatchEvent(new Event('change'));
                }
                
                // Update value display if it exists
                if (valueElement) {
                    valueElement.textContent = value;
                }
            }
        });
        
        // Force refresh of color controls
        ['particle', 'line', 'dot'].forEach(type => {
            const colorKey = `${type}Color`;
            const opacityKey = `${type}Opacity`;
            
            if (settings[colorKey]) {
                const colorPicker = document.getElementById(`${type}ColorPicker`);
                if (colorPicker) {
                    colorPicker.value = settings[colorKey];
                    colorPicker.dispatchEvent(new Event('input'));
                }
            }
            
            if (settings[opacityKey] !== undefined) {
                const opacityPicker = document.getElementById(`${type}OpacityPicker`);
                if (opacityPicker) {
                    opacityPicker.value = settings[opacityKey];
                    opacityPicker.dispatchEvent(new Event('input'));
                }
            }
        });
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

    async loadExamplePresets() {
        try {
            // Get list of JSON files from examples directory
            const response = await fetch('/examples/list');
            if (!response.ok) {
                throw new Error(`Failed to load examples: ${response.status}`);
            }
            const files = await response.json();
            
            if (!files || files.length === 0) {
                console.log('No example files found');
                return;
            }
            
            // Filter for JSON files and get their base names
            const presetFiles = files
                .filter(file => file.endsWith('.json'))
                .slice(0, 4); // Take only first 4 JSON files
            const presetNames = presetFiles.map(file => file.replace('.json', ''));
            console.log('Preset files:', presetFiles);
            console.log('Preset names:', presetNames);

            // Create the presets HTML
            const presetGrid = document.createElement('div');
            presetGrid.className = 'preset-grid';
            
            for (const name of presetNames) {
                const presetItem = document.createElement('div');
                presetItem.className = 'preset-item';
                presetItem.dataset.preset = name;
                
                // Check if matching thumbnail exists
                const thumbnailName = files.find(f => 
                    f === `${name}.jpg` || 
                    f === `${name}.png`
                );
                const thumbnailPath = thumbnailName ? 
                    `/examples/${thumbnailName}` : 
                    '/examples/default.jpg';
                
                presetItem.innerHTML = `
                    <img src="${thumbnailPath}" alt="Preset ${name}" onerror="this.src='/examples/default.jpg'">
                    <span>Preset ${name.replace(/^\d+_/, '')}</span>
                `;
                
                presetGrid.appendChild(presetItem);
            }
            
            // Add to page
            const presetsContainer = document.querySelector('.example-presets');
            presetsContainer.innerHTML = '<h3>Example Presets</h3>';
            presetsContainer.appendChild(presetGrid);
            
            // Setup listeners after adding to DOM
            this.setupPresetListeners();
            
        } catch (error) {
            console.error('Error loading example presets:', error);
        }
    }
}
