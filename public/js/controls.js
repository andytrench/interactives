console.log('Controls.js loading...');

class Controls {
    constructor() {
        console.log('Controls constructor called');
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
            if (control) {
                control.addEventListener('input', () => this.updateConfig());
            }
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

    setupColorControls() {
        ['particle', 'line'].forEach(type => {
            const colorPicker = document.getElementById(`${type}ColorPicker`);
            const opacityPicker = document.getElementById(`${type}OpacityPicker`);
            const opacityValue = document.getElementById(`${type}OpacityValue`);
            const acceptButton = document.getElementById(`accept${type.charAt(0).toUpperCase() + type.slice(1)}Color`);
            
            if (colorPicker && opacityPicker && opacityValue && acceptButton) {
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
                });
            }
        });
    }

    setupPatternControls() {
        const patternSelect = document.getElementById('pattern');
        if (patternSelect) {
            patternSelect.addEventListener('change', () => {
                CONFIG.pattern = patternSelect.value;
            });
        }

        const patternScale = document.getElementById('patternScale');
        if (patternScale) {
            patternScale.addEventListener('input', () => {
                CONFIG.patternScale = parseFloat(patternScale.value);
                document.getElementById('patternScaleValue').textContent = patternScale.value;
            });
        }

        const patternDistance = document.getElementById('patternDistance');
        if (patternDistance) {
            patternDistance.addEventListener('input', () => {
                CONFIG.patternDistance = parseInt(patternDistance.value);
                document.getElementById('patternDistanceValue').textContent = patternDistance.value;
            });
        }
    }

    updateConfig() {
        // Update all configuration values from controls
        if (this.controls.iterations) CONFIG.maxIterations = parseInt(this.controls.iterations.value);
        if (this.controls.zoom) CONFIG.zoom = parseInt(this.controls.zoom.value);
        if (this.controls.particleCount) CONFIG.particleCount = parseInt(this.controls.particleCount.value);
        if (this.controls.fadeSpeed) CONFIG.fadeSpeed = parseInt(this.controls.fadeSpeed.value) / 1000;
        if (this.controls.connectionFadeSpeed) CONFIG.connectionFadeSpeed = parseInt(this.controls.connectionFadeSpeed.value) / 1000;
        if (this.controls.attractionStrength) CONFIG.attractionStrength = parseInt(this.controls.attractionStrength.value) / 100;
        if (this.controls.repulsionStrength) CONFIG.repulsionStrength = parseInt(this.controls.repulsionStrength.value) / 100;
        if (this.controls.particleSize) CONFIG.particleSize = parseFloat(this.controls.particleSize.value);
        if (this.controls.lineThickness) CONFIG.lineThickness = parseFloat(this.controls.lineThickness.value);
        if (this.controls.connectionDistance) CONFIG.connectionDistance = parseInt(this.controls.connectionDistance.value);
        if (this.controls.attractionDistance) CONFIG.attractionDistance = parseInt(this.controls.attractionDistance.value);
        if (this.controls.fullMatrixMode) CONFIG.fullMatrixMode = this.controls.fullMatrixMode.checked;
        if (this.controls.colorfulMode) CONFIG.colorfulMode = this.controls.colorfulMode.checked;
        if (this.controls.persistentConnections) CONFIG.persistentConnections = this.controls.persistentConnections.checked;

        this.updateDisplayValues();
    }

    updateDisplayValues() {
        // Update all display values in the UI
        Object.keys(this.controls).forEach(id => {
            const valueElement = document.getElementById(`${id}Value`);
            if (valueElement && CONFIG[id] !== undefined) {
                valueElement.textContent = CONFIG[id];
            }
        });
    }
}

console.log('Controls.js loaded'); 