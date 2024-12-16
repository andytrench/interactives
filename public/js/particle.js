class Particle {
    constructor(x, y, size, color, initialLife = 1, maxLife = 2) {
        this.x = x;
        this.y = y;
        this.startX = x;  // Store starting position
        this.startY = y;
        this.size = size;
        this.color = color;
        this.connections = new Set();
        this.connectionAlpha = 1;
        this.alpha = 0;
        this.life = initialLife;
        this.maxLife = maxLife;
        this.distanceTraveled = 0;  // Track total distance traveled
        
        // Add momentum properties
        this.targetX = x;
        this.targetY = y;
        this.ax = 0; // acceleration X
        this.ay = 0; // acceleration Y
        
        // Random initial velocity with momentum
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * CONFIG.travelSpeed;
        this.vy = Math.sin(angle) * CONFIG.travelSpeed;
    }

    calculateAlpha() {
        const fadeInThreshold = this.maxLife * this.fadeInDuration;
        const fadeOutThreshold = this.maxLife * (1 - this.fadeOutDuration);

        if (this.life < fadeInThreshold) {
            // Fading in
            return this.life / fadeInThreshold;
        } else if (this.life > fadeOutThreshold) {
            // Fading out
            return (this.maxLife - this.life) / (this.maxLife * this.fadeOutDuration);
        } else {
            // Fully visible
            return 1;
        }
    }

    update(mouse, canvas) {
        const oldX = this.x;
        const oldY = this.y;
        
        // Reset acceleration
        this.ax = 0;
        this.ay = 0;

        // Mouse interaction with momentum
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONFIG.attractionDistance) {
                const force = (1 - distance / CONFIG.attractionDistance);
                
                // Apply attraction
                const attractionForce = CONFIG.attractionStrength * force;
                this.ax += (dx / distance) * attractionForce;
                this.ay += (dy / distance) * attractionForce;
                
                // Apply repulsion (note the negative force and different scaling)
                const repulsionForce = CONFIG.repulsionStrength * (1 - force);
                this.ax -= (dx / distance) * repulsionForce;
                this.ay -= (dy / distance) * repulsionForce;
            }
        }

        // Apply momentum (now can go up to 2.0)
        this.vx = this.vx * CONFIG.momentum + this.ax;
        this.vy = this.vy * CONFIG.momentum + this.ay;

        // Apply friction
        this.vx *= (1 - CONFIG.friction);
        this.vy *= (1 - CONFIG.friction);

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Calculate distance traveled
        const frameDist = Math.sqrt(
            Math.pow(this.x - oldX, 2) + 
            Math.pow(this.y - oldY, 2)
        );
        this.distanceTraveled += frameDist;

        // Max travel distance behavior with momentum
        if (this.distanceTraveled > CONFIG.maxTravelDistance) {
            // Calculate return force to starting position
            const returnDx = this.startX - this.x;
            const returnDy = this.startY - this.y;
            const returnDist = Math.sqrt(returnDx * returnDx + returnDy * returnDy);
            
            if (returnDist > 0) {
                this.ax += (returnDx / returnDist) * 0.01;
                this.ay += (returnDy / returnDist) * 0.01;
            }
        }

        // Bounce off walls with momentum
        if (this.x < 0 || this.x > canvas.width) {
            this.vx *= -CONFIG.momentum;
            this.x = this.x < 0 ? 0 : canvas.width;
        }
        if (this.y < 0 || this.y > canvas.height) {
            this.vy *= -CONFIG.momentum;
            this.y = this.y < 0 ? 0 : canvas.height;
        }

        // Update life and alpha
        this.life += CONFIG.fadeSpeed;
        this.alpha = Math.min(1, Math.min(this.life, 1 - this.life));

        return this.life <= this.maxLife;
    }

    draw(ctx) {
        // Calculate final opacity based on particle lifecycle and config
        const finalOpacity = this.alpha * (CONFIG.particleOpacity / 100);
        ctx.globalAlpha = finalOpacity;
        
        // Draw glow effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * CONFIG.particleSize * 2
        );
        
        if (CONFIG.colorfulMode) {
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
            // Convert hex color to rgba for gradient
            const hex = CONFIG.particleColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * CONFIG.particleSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = CONFIG.colorfulMode ? this.color : `${CONFIG.particleColor}`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * CONFIG.particleSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
} 