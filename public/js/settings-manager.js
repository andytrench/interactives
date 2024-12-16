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
            const filename = `${settingsName}.json`;
            
            // Collect all current settings
            const settings = {
                ...CONFIG,
                timestamp: new Date().toISOString(),
                name: settingsName
            };

            // Create a Blob containing the settings
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create download link and trigger it
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);

            // Update settings list
            this.addSettingToList(settingsName);
            
            this.showNotification('Settings saved successfully!', 'success');
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
        // Update CONFIG object with all valid settings
        Object.keys(settings).forEach(key => {
            if (key in CONFIG) {
                CONFIG[key] = settings[key];
            }
        });

        // Update UI controls to reflect new settings
        this.updateUIControls(settings);
        
        // Trigger color update if colors changed
        if (settings.particleColor || settings.lineColor) {
            window.dispatchEvent(new CustomEvent('colorUpdate'));
        }
    }

    updateUIControls(settings) {
        console.log('Updating UI controls with settings:', settings);
        
        // Special handling for forces and other numeric values that need scaling
        const scaleFactors = {
            attractionStrength: 100, // Convert 0.06 to 6
            repulsionStrength: 100,
            fadeSpeed: 1000,
            connectionFadeSpeed: 1000
        };
        
        // Update all UI elements to match loaded settings
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            const valueElement = document.getElementById(`${key}Value`);
            
            if (element) {
                let displayValue = settings[key];
                
                // Scale the value for the slider if needed
                if (scaleFactors[key]) {
                    displayValue = settings[key] * scaleFactors[key];
                }
                
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                } else if (element.type === 'range' || element.type === 'number') {
                    element.value = displayValue;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                } else if (element.type === 'color') {
                    element.value = settings[key];
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                } else if (element.tagName === 'SELECT') {
                    element.value = settings[key];
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                // Update value display elements
                if (valueElement) {
                    if (typeof settings[key] === 'number') {
                        if (scaleFactors[key]) {
                            valueElement.textContent = displayValue;
                        } else {
                            // Handle decimal places for floating point numbers
                            valueElement.textContent = Number(settings[key]).toFixed(
                                Number.isInteger(settings[key]) ? 0 : 3
                            );
                        }
                    } else {
                        valueElement.textContent = settings[key];
                    }
                }
            }
        });

        // Special handling for color pickers and opacity
        ['particle', 'line'].forEach(type => {
            const colorPicker = document.getElementById(`${type}ColorPicker`);
            const opacityPicker = document.getElementById(`${type}OpacityPicker`);
            const opacityValue = document.getElementById(`${type}OpacityValue`);
            
            if (colorPicker && settings[`${type}Color`]) {
                colorPicker.value = settings[`${type}Color`];
                colorPicker.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            if (opacityPicker && settings[`${type}Opacity`] !== undefined) {
                opacityPicker.value = settings[`${type}Opacity`];
                if (opacityValue) {
                    opacityValue.textContent = `${settings[`${type}Opacity`]}%`;
                }
                opacityPicker.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        // Force update of pattern controls
        const patternScale = document.getElementById('patternScale');
        const patternDistance = document.getElementById('patternDistance');
        
        if (patternScale) {
            patternScale.value = settings.patternScale;
            document.getElementById('patternScaleValue').textContent = settings.patternScale;
            patternScale.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (patternDistance) {
            patternDistance.value = settings.patternDistance;
            document.getElementById('patternDistanceValue').textContent = settings.patternDistance;
            patternDistance.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Trigger a global update event
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
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
        try {
            // Try multiple possible paths for the settings file
            const paths = [
                '/settings/default-settings.json',
                './settings/default-settings.json',
                '/public/settings/default-settings.json'
            ];

            let response;
            for (const path of paths) {
                try {
                    response = await fetch(path);
                    if (response.ok) break;
                } catch (e) {
                    console.log(`Tried path ${path}: ${e.message}`);
                }
            }

            if (!response || !response.ok) {
                throw new Error(`Could not load settings from any path`);
            }

            const settings = await response.json();
            console.log('Loading default settings:', settings);
            
            // Ensure all numeric values are properly parsed
            Object.keys(settings).forEach(key => {
                if (typeof settings[key] === 'string' && !isNaN(settings[key])) {
                    settings[key] = parseFloat(settings[key]);
                }
            });

            this.applySettings(settings);
            this.addSettingToList('default');
        } catch (error) {
            console.error('Error loading default settings:', error);
            this.showNotification('Error loading default settings', 'error');
            
            // Fallback to hardcoded default settings if loading fails
            const fallbackSettings = {
                particleCount: 100,
                particleSize: 15.7,
                fadeSpeed: 0.001,
                connectionDistance: 260,
                lineThickness: 2.8,
                connectionFadeSpeed: 0.001,
                attractionStrength: 0.06,
                attractionDistance: 360,
                repulsionStrength: 0,
                maxIterations: 100,
                zoom: 23,
                seahorseX: -0.745,
                seahorseY: 0.1,
                fullMatrixMode: false,
                colorfulMode: false,
                persistentConnections: false,
                glowIntensity: 0.5,
                minOpacity: 0.1,
                maxOpacity: 0.8,
                particleSpawnRate: 10,
                minParticleLife: 0.5,
                maxParticleLife: 2,
                fadeInDuration: 0.2,
                fadeOutDuration: 0.3,
                particleColor: "#9437ff",
                particleOpacity: 100,
                lineColor: "#00f900",
                lineOpacity: 100,
                pattern: "spiral",
                patternScale: 3.1,
                patternDistance: 26,
                dotColor: "#00ffff",
                dotOpacity: 100
            };
            
            console.log('Using fallback settings:', fallbackSettings);
            this.applySettings(fallbackSettings);
        }
    }
}
