class SettingsManager {
    constructor(controls) {
        this.controls = controls;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('loadSettings').addEventListener('click', () => this.loadSettings());
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

            // Show success message
            this.showNotification('Settings saved successfully!', 'success');

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }

    loadSettings() {
        // Create file input
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
        // Update CONFIG object
        Object.assign(CONFIG, settings);

        // Update all UI controls to reflect new settings
        this.updateUIControls(settings);
    }

    updateUIControls(settings) {
        // Update range inputs
        ['iterations', 'zoom', 'particleCount', 'fadeSpeed', 'connectionFadeSpeed',
         'attractionStrength', 'repulsionStrength', 'particleSize', 'lineThickness',
         'connectionDistance', 'attractionDistance', 'patternScale', 'patternDistance'
        ].forEach(id => {
            const element = document.getElementById(id);
            if (element && settings[id] !== undefined) {
                element.value = settings[id];
                const valueElement = document.getElementById(`${id}Value`);
                if (valueElement) {
                    valueElement.textContent = settings[id];
                }
            }
        });

        // Update checkboxes
        ['fullMatrixMode', 'colorfulMode', 'persistentConnections'].forEach(id => {
            const element = document.getElementById(id);
            if (element && settings[id] !== undefined) {
                element.checked = settings[id];
            }
        });

        // Update color pickers and opacity
        ['particle', 'line'].forEach(type => {
            const colorPicker = document.getElementById(`${type}ColorPicker`);
            const opacityPicker = document.getElementById(`${type}OpacityPicker`);
            if (colorPicker && settings[`${type}Color`]) {
                colorPicker.value = settings[`${type}Color`];
                const event = new Event('input', { bubbles: true });
                colorPicker.dispatchEvent(event);
            }
            if (opacityPicker && settings[`${type}Opacity`]) {
                opacityPicker.value = settings[`${type}Opacity`];
                document.getElementById(`${type}OpacityValue`).textContent = `${settings[`${type}Opacity`]}%`;
                const event = new Event('input', { bubbles: true });
                opacityPicker.dispatchEvent(event);
            }
        });

        // Update pattern select
        const patternSelect = document.getElementById('pattern');
        if (patternSelect && settings.pattern) {
            patternSelect.value = settings.pattern;
            const event = new Event('change', { bubbles: true });
            patternSelect.dispatchEvent(event);
        }

        window.dispatchEvent(new CustomEvent('colorUpdate'));
    }

    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('settings-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'settings-notification';
            document.body.appendChild(notification);
        }

        // Set notification content and style
        notification.textContent = message;
        notification.className = `settings-notification ${type}`;

        // Show notification
        notification.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}
