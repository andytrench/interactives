class Renderer {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.controls = new Controls();
        this.patternVisualizer = new PatternVisualizer(this.canvas, this.ctx);
        this.settingsManager = new SettingsManager(this.controls);
        
        this.setupCanvas();
        this.initParticles();
        this.setupPatternControls();
        this.setupColorUpdateListener();
        this.animate();

        this.lastParticleSpawnTime = 0;
        this.spawnRate = 10; // Spawn X particles per frame
    }

    setupCanvas() {
        const resizeCanvas = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const position = PatternGenerator.generatePosition(this.canvas);
        if (position) {
            const particle = new Particle(
                position.x,
                position.y,
                position.size,
                CONFIG.colorfulMode ? position.color : CONFIG.particleColor,
                Math.random(), // initialLife
                0.5 + Math.random() * 1.5 // maxLife
            );
            this.particles.push(particle);
        }
    }

    drawConnection(particle1, particle2) {
        if (CONFIG.persistentConnections) {
            this.drawPersistentConnection(particle1, particle2);
        } else {
            this.drawFadingConnection(particle1, particle2);
        }
    }

    drawPersistentConnection(particle1, particle2) {
        this.ctx.globalAlpha = Math.min(particle1.alpha, particle2.alpha) * 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(particle1.x, particle1.y);
        this.ctx.lineTo(particle2.x, particle2.y);
        this.ctx.stroke();
    }

    drawFadingConnection(particle1, particle2) {
        if (!particle1.connections.has(particle2)) {
            particle1.connections.add(particle2);
            particle2.connections.add(particle1);
            particle1.connectionAlpha = 1;
            particle2.connectionAlpha = 1;
        }

        particle1.connectionAlpha = Math.max(0, particle1.connectionAlpha - CONFIG.connectionFadeSpeed);
        particle2.connectionAlpha = Math.max(0, particle2.connectionAlpha - CONFIG.connectionFadeSpeed);

        this.ctx.globalAlpha = Math.min(
            particle1.alpha,
            particle2.alpha,
            particle1.connectionAlpha,
            particle2.connectionAlpha
        ) * 0.5;

        this.ctx.beginPath();
        this.ctx.moveTo(particle1.x, particle1.y);
        this.ctx.lineTo(particle2.x, particle2.y);
        this.ctx.stroke();
    }

    handleConnections() {
        this.ctx.strokeStyle = CONFIG.colorfulMode ? 
            'rgba(255, 255, 255, 0.03)' : 
            'rgba(0, 255, 0, 0.03)';
        this.ctx.lineWidth = CONFIG.lineThickness;

        if (CONFIG.fullMatrixMode) {
            this.handleFullMatrixConnections();
        } else {
            this.handleDistanceBasedConnections();
        }
    }

    handleFullMatrixConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                this.drawConnection(this.particles[i], this.particles[j]);
            }
        }
    }

    handleDistanceBasedConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONFIG.connectionDistance) {
                    this.drawConnection(this.particles[i], this.particles[j]);
                } else {
                    this.particles[i].connections.delete(this.particles[j]);
                    this.particles[j].connections.delete(this.particles[i]);
                }
            }
        }
    }

    maintainParticleCount() {
        const particlesToSpawn = Math.min(
            this.spawnRate,
            CONFIG.particleCount - this.particles.length
        );

        for (let i = 0; i < particlesToSpawn; i++) {
            this.createParticle();
        }
    }

    animate = () => {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const isAlive = particle.update(this.controls.mouse, this.canvas);
            
            if (!isAlive) {
                this.particles.splice(i, 1);
                this.createParticle();
            } else {
                particle.draw(this.ctx);
            }
        }

        this.handleEnhancedConnections();
        this.patternVisualizer.draw();

        this.maintainParticleCount();
        requestAnimationFrame(this.animate);
    }

    handleEnhancedConnections() {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        if (CONFIG.colorfulMode) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        } else {
            const hex = CONFIG.lineColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const opacity = CONFIG.lineOpacity / 100;
            this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONFIG.connectionDistance) {
                    const opacity = 1 - (distance / CONFIG.connectionDistance);
                    this.ctx.lineWidth = CONFIG.lineThickness * opacity;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.globalAlpha = opacity * 0.5;
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1;
                }
            }
        }
    }

    setupPatternControls() {
        const toggleBtn = document.getElementById('togglePattern');
        const resetBtn = document.getElementById('resetPattern');

        toggleBtn.addEventListener('click', () => {
            const isVisible = this.patternVisualizer.toggle();
            toggleBtn.textContent = isVisible ? 'Hide Pattern' : 'Show Pattern';
            toggleBtn.classList.toggle('active', isVisible);
        });

        resetBtn.addEventListener('click', () => {
            this.particles = [];
            this.initParticles();
        });
    }

    setupColorUpdateListener() {
        window.addEventListener('colorUpdate', () => {
            this.particles.forEach(particle => {
                if (!CONFIG.colorfulMode) {
                    particle.color = CONFIG.particleColor;
                }
            });
        });
    }
}

// Initialize the renderer when the page loads
window.addEventListener('load', () => {
    new Renderer();
}); 