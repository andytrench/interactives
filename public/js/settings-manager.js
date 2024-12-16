class SettingsManager {
    constructor(controls) {
        this.controls = controls;
        this.setupEventListeners();
        this.loadSavedSettingsList();
    }

    setupEventListeners() {
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('loadSettings').addEventListener('click', () => this.loadSettings());
        
        // Add change listener for settings list dropdown
        const settingsList = document.getElementById('savedSettingsList');
        settingsList.addEventListener('change', () => {
            if (settingsList.value) {
                this.loadSettingsByName(settingsList.value);
            }
        });
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
        // Update all UI elements to match loaded settings
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            const valueElement = document.getElementById(`${key}Value`);
            
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                } else if (element.type === 'range' || element.type === 'number') {
                    element.value = settings[key];
                } else if (element.type === 'color') {
                    element.value = settings[key];
                }
            }
            
            if (valueElement) {
                valueElement.textContent = settings[key];
            }
        });
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
}
