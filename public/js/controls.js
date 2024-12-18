console.log('Controls.js loading...');

class Controls {
    constructor() {
        console.log('Controls constructor called');
        this.mouse = { x: null, y: null, radius: 100 };
        this.rocketMode = false;
        this.initializeControls();
        this.setInitialValues();
        this.setupEventListeners();
        this.setupColorControls();
        this.setupPatternControls();
        
        this.setupSettingsToggle();
        this.setupRocketControl();
    }

    setupSettingsToggle() {
        // Add settings toggle
        const toggleButton = document.getElementById('toggleSettings');
        const controls = document.getElementById('controls');
        const toggleText = document.getElementById('toggleSettingsText');
        
        // Remove any existing click listeners
        toggleButton.replaceWith(toggleButton.cloneNode(true));
        
        // Get fresh reference after cloning
        const newToggleButton = document.getElementById('toggleSettings');
        
        newToggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Toggle button clicked');
            controls.classList.toggle('hidden');
            newToggleButton.classList.toggle('hidden');
            
            const isHidden = controls.classList.contains('hidden');
            document.getElementById('toggleSettingsText').textContent = 
                isHidden ? 'Show Settings' : 'Hide Settings';
            
            console.log('Settings panel is now:', isHidden ? 'hidden' : 'visible');
        });
    }

    initializeControls() {
        // Initialize all control elements
        const controlIds = [
            'iterations', 'zoom', 'particleCount', 'fadeSpeed', 
            'connectionFadeSpeed', 'attractionStrength', 'repulsionStrength',
            'particleSize', 'lineThickness', 'connectionDistance',
            'attractionDistance', 'attractionMomentum', 'fullMatrixMode', 'colorfulMode',
            'persistentConnections', 'particlesOnTop', 'maxTravelDistance', 'travelSpeed',
            'momentum', 'friction'
        ];

        this.controls = {};
        controlIds.forEach(id => {
            this.controls[id] = document.getElementById(id);
        });
    }

    setInitialValues() {
        console.log('Setting initial values with CONFIG:', CONFIG);
        // Set initial values for all controls based on CONFIG
        Object.keys(CONFIG).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                console.log(`Setting ${key} to ${CONFIG[key]}`);
                if (element.type === 'checkbox') {
                    element.checked = CONFIG[key];
                } else if (element.type === 'range' || element.type === 'number' || element.type === 'color') {
                    element.value = CONFIG[key];
                } else if (element.tagName === 'SELECT') {
                    element.value = CONFIG[key];
                }
                
                // Trigger input/change event to update displays
                const event = new Event(element.type === 'checkbox' || element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true });
                element.dispatchEvent(event);
            }
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

    setupRocketControl() {
        const rocket = document.getElementById('rocketIcon');
        const controls = document.getElementById('controls');
        const toggleButton = document.getElementById('toggleSettings');
        let isDragging = false;
        let isRocketActive = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let rocketStartX = 0;
        let rocketStartY = 0;

        // Disable default mouse interaction when rocket is active
        const disableMouseInteraction = () => {
            this.mouse.x = null;
            this.mouse.y = null;
            this.rocketMode = true;  // Flag to prevent normal mouse interaction
        };

        // Enable default mouse interaction when rocket is inactive
        const enableMouseInteraction = () => {
            this.rocketMode = false;
        };

        // Create a new rocket element for the canvas
        const canvasRocket = document.createElement('img');
        canvasRocket.src = '/images/rockit.png';
        canvasRocket.id = 'canvasRocket';
        canvasRocket.className = 'canvas-rocket';
        document.body.appendChild(canvasRocket);
        canvasRocket.style.display = 'none';

        // Function to get rocket center position
        const getRocketCenter = () => {
            const rect = canvasRocket.getBoundingClientRect();
            return {
                x: rect.left + rect.width/2,
                y: rect.top + rect.height/2
            };
        };

        // Function to update rocket position
        const updateRocketPosition = (x, y) => {
            canvasRocket.style.left = `${x}px`;
            canvasRocket.style.top = `${y}px`;

            if (isRocketActive || isDragging) {
                const center = getRocketCenter();
                this.mouse.x = center.x;
                this.mouse.y = center.y;
            }
        };

        // Function to start dragging
        const startDragging = (e) => {
            e.preventDefault();
            isDragging = true;
            
            const rect = (isRocketActive ? canvasRocket : rocket).getBoundingClientRect();
            // Store initial positions
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            rocketStartX = rect.left;
            rocketStartY = rect.top;
            
            canvasRocket.classList.add('dragging');
            if (!isRocketActive) {
                // Initial placement from menu
                updateRocketPosition(e.clientX - 20, e.clientY - 20);
            }
        };

        // Start dragging from menu
        rocket.addEventListener('mousedown', (e) => {
            if (!isRocketActive) {
                // Hide the rocket icon in the menu
                rocket.style.display = 'none';
                // Show canvas rocket while dragging
                canvasRocket.style.display = 'block';
                canvasRocket.style.position = 'fixed';
                canvasRocket.style.pointerEvents = 'auto';
                startDragging(e);
            }
        });

        // Handle dragging the active rocket
        canvasRocket.addEventListener('mousedown', (e) => {
            if (isRocketActive) {
                startDragging(e);
            }
        });

        // Handle drag
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
                // Calculate new position based on mouse movement
                const deltaX = e.clientX - dragStartX;
                const deltaY = e.clientY - dragStartY;
                const newX = rocketStartX + deltaX;
                const newY = rocketStartY + deltaY;
                updateRocketPosition(newX, newY);
            }
        });

        // Handle drop
        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                canvasRocket.classList.remove('dragging');
                
                if (!isRocketActive) {
                    isRocketActive = true;
                    disableMouseInteraction();
                    canvasRocket.classList.add('active');
                    controls.classList.add('hidden');
                    toggleButton.classList.add('hidden');
                    toggleButton.querySelector('.text').textContent = 'Show Settings';
                }
                
                // Final position already set by last mousemove
            }
        });

        // Double-click to deactivate
        canvasRocket.addEventListener('dblclick', () => {
            if (isRocketActive) {
                isRocketActive = false;
                enableMouseInteraction();
                canvasRocket.style.display = 'none';
                this.mouse.x = null;
                this.mouse.y = null;
                controls.classList.remove('hidden');
                toggleButton.classList.remove('hidden');
                // Show the rocket icon in the menu again
                rocket.style.display = 'block';
            }
        });

        // Override default mouse move behavior
        document.addEventListener('mousemove', (e) => {
            if (this.rocketMode) {
                // Remove or comment out the stopPropagation call
                // e.stopPropagation();  // Remove this line

                // Add verbose logging
                console.log('Mousemove event detected in rocketMode:', {
                    isDragging,
                    isRocketActive,
                    mouseX: e.clientX,
                    mouseY: e.clientY
                });

                // Prevent default mouse interaction when rocket is active
                if (!isDragging && isRocketActive) {
                    const center = getRocketCenter();
                    this.mouse.x = center.x;
                    this.mouse.y = center.y;
                }
            }
        });
    }

    updateConfig() {
        // Update all configuration values from controls
        if (this.controls.iterations) CONFIG.maxIterations = parseInt(this.controls.iterations.value);
        if (this.controls.zoom) CONFIG.zoom = parseInt(this.controls.zoom.value);
        if (this.controls.particleCount) CONFIG.particleCount = parseInt(this.controls.particleCount.value);
        if (this.controls.fadeSpeed) CONFIG.fadeSpeed = parseFloat(this.controls.fadeSpeed.value);
        if (this.controls.connectionFadeSpeed) CONFIG.connectionFadeSpeed = parseInt(this.controls.connectionFadeSpeed.value) / 1000;
        if (this.controls.attractionStrength) CONFIG.attractionStrength = parseFloat(this.controls.attractionStrength.value);
        if (this.controls.attractionMomentum) CONFIG.attractionMomentum = parseFloat(this.controls.attractionMomentum.value);
        if (this.controls.repulsionStrength) CONFIG.repulsionStrength = parseFloat(this.controls.repulsionStrength.value);
        if (this.controls.particleSize) CONFIG.particleSize = parseFloat(this.controls.particleSize.value);
        if (this.controls.lineThickness) CONFIG.lineThickness = parseFloat(this.controls.lineThickness.value);
        if (this.controls.connectionDistance) CONFIG.connectionDistance = parseInt(this.controls.connectionDistance.value);
        if (this.controls.attractionDistance) CONFIG.attractionDistance = parseInt(this.controls.attractionDistance.value);
        if (this.controls.fullMatrixMode) CONFIG.fullMatrixMode = this.controls.fullMatrixMode.checked;
        if (this.controls.colorfulMode) CONFIG.colorfulMode = this.controls.colorfulMode.checked;
        if (this.controls.persistentConnections) CONFIG.persistentConnections = this.controls.persistentConnections.checked;
        if (this.controls.particlesOnTop) CONFIG.particlesOnTop = this.controls.particlesOnTop.checked;
        if (this.controls.maxTravelDistance) {
            CONFIG.maxTravelDistance = parseInt(this.controls.maxTravelDistance.value);
        }
        if (this.controls.travelSpeed) {
            CONFIG.travelSpeed = parseFloat(this.controls.travelSpeed.value);
        }
        if (this.controls.momentum) {
            CONFIG.momentum = parseFloat(this.controls.momentum.value);
        }
        if (this.controls.friction) {
            CONFIG.friction = parseFloat(this.controls.friction.value);
        }

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