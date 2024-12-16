class Controls {
    constructor() {
        this.mouse = { x: null, y: null, radius: 100 };
        this.initializeControls();
        this.setupEventListeners();
        this.setupColorControls();
        this.setupPatternControls();
    }

    initializeControls() {
        // Initialize all control elements
        const controlIds = [
            'iterations', 'zoom', 'particleCount', 'fadeSpeed', 
            'connectionFadeSpeed', 'attractionStrength', 'repulsionStrength',
            'particleSize', 'lineThickness', 'connectionDistance',
            'attractionDistance', 'fullMatrixMode', 'colorfulMode',
            'persistentConnections'
        ];

        this.controls = {};
        controlIds.forEach(id => {
            this.controls[id] = document.getElementById(id);
        });
    }

    setupEventListeners() {
        // Add input listeners to all controls
        Object.values(this.controls).forEach(control => {
            control.addEventListener('input', () => this.updateConfig());
        });

        // Mouse event listeners
        const canvas = document.getElementById('particleCanvas');
        canvas.addEventListener('mousemove', (event) => {
            this.mouse.x = event.x;
            this.mouse.y = event.y;
        });

        canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    updateConfig() {
        // Update all configuration values from controls
        CONFIG.maxIterations = parseInt(this.controls.iterations.value);
        CONFIG.zoom = parseInt(this.controls.zoom.value);
        CONFIG.particleCount = parseInt(this.controls.particleCount.value);
        CONFIG.fadeSpeed = parseInt(this.controls.fadeSpeed.value) / 1000;
        CONFIG.connectionFadeSpeed = parseInt(this.controls.connectionFadeSpeed.value) / 1000;
        CONFIG.attractionStrength = parseInt(this.controls.attractionStrength.value) / 100;
        CONFIG.repulsionStrength = parseInt(this.controls.repulsionStrength.value) / 100;
        CONFIG.particleSize = parseFloat(this.controls.particleSize.value);
        CONFIG.lineThickness = parseFloat(this.controls.lineThickness.value);
        CONFIG.connectionDistance = parseInt(this.controls.connectionDistance.value);
        CONFIG.attractionDistance = parseInt(this.controls.attractionDistance.value);
        CONFIG.fullMatrixMode = this.controls.fullMatrixMode.checked;
        CONFIG.colorfulMode = this.controls.colorfulMode.checked;
        CONFIG.persistentConnections = this.controls.persistentConnections.checked;

        // Update display values
        this.updateDisplayValues();
    }

    updateDisplayValues() {
        // Update all display values in the UI
        Object.keys(this.controls).forEach(id => {
            const valueElement = document.getElementById(`${id}Value`);
            if (valueElement) {
                valueElement.textContent = CONFIG[id];
            }
        });
    }

    setupColorControls() {
        ['particle', 'line'].forEach(type => {
            const colorPicker = document.getElementById(`${type}ColorPicker`);
            const opacityPicker = document.getElementById(`${type}OpacityPicker`);
            const opacityValue = document.getElementById(`${type}OpacityValue`);
            const acceptButton = document.getElementById(`accept${type.charAt(0).toUpperCase() + type.slice(1)}Color`);
            
            // Initialize pickers with current values
            colorPicker.value = CONFIG[`${type}Color`];
            opacityPicker.value = CONFIG[`${type}Opacity`];
            
            // Update opacity value display when slider moves
            opacityPicker.addEventListener('input', () => {
                opacityValue.textContent = `${opacityPicker.value}%`;
            });
            
            // Apply colors only when accept button is clicked
            acceptButton.addEventListener('click', () => {
                CONFIG[`${type}Color`] = colorPicker.value;
                CONFIG[`${type}Opacity`] = parseInt(opacityPicker.value);
                
                // Force particle color update for particle color changes
                if (type === 'particle') {
                    window.dispatchEvent(new CustomEvent('colorUpdate'));
                }
                
                // Log the color change
                console.log(`${type} color updated:`, {
                    color: CONFIG[`${type}Color`],
                    opacity: CONFIG[`${type}Opacity`]
                });
            });
        });
    }

    setupPatternControls() {
        const patternSelect = document.getElementById('pattern');
        patternSelect.addEventListener('change', () => {
            CONFIG.pattern = patternSelect.value;
        });

        const patternScale = document.getElementById('patternScale');
        patternScale.addEventListener('input', () => {
            CONFIG.patternScale = parseFloat(patternScale.value);
            document.getElementById('patternScaleValue').textContent = patternScale.value;
        });

        const patternDistance = document.getElementById('patternDistance');
        patternDistance.addEventListener('input', () => {
            CONFIG.patternDistance = parseInt(patternDistance.value);
            document.getElementById('patternDistanceValue').textContent = patternDistance.value;
        });
    }
} 