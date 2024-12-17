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
        
        // Add momentum properties
        this.targetX = x;
        this.targetY = y;
        this.ax = 0; // acceleration X
        this.ay = 0; // acceleration Y
        
        // Random initial velocity with momentum
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * CONFIG.travelSpeed * CONFIG.momentum;
        this.vy = Math.sin(angle) * CONFIG.travelSpeed * CONFIG.momentum;
    }

    updateAlpha() {
        // Update life and alpha
        this.life += CONFIG.fadeSpeed;
        this.alpha = Math.min(1, Math.min(this.life, 1 - this.life));
    }

    update(mouse, canvas) {
        const oldX = this.x;
        const oldY = this.y;
        
        // Reset acceleration
        this.ax = 0;
        this.ay = 0;

        // Update alpha based on life
        this.updateAlpha();
        
        let distance = Infinity; // Initialize distance
        
        // Calculate distance from start position
        const distanceFromStart = Math.sqrt(
            Math.pow(this.x - this.startX, 2) + 
            Math.pow(this.y - this.startY, 2)
        );
        
        // Calculate travel speed based on distance from start
        const speedScale = Math.max(0, 1 - (distanceFromStart / CONFIG.maxTravelDistance));
        const currentSpeed = CONFIG.travelSpeed * speedScale * CONFIG.momentum;
        
        // Handle mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < CONFIG.attractionDistance) {
                // Calculate base attraction force
                const force = CONFIG.attractionStrength;
                
                // Apply attraction with momentum
                const newVx = (dx / distance) * force;
                const newVy = (dy / distance) * force;
                
                // Scale momentum effect by the configured value
                const momentumScale = CONFIG.attractionMomentum;
                const momentumVx = this.vx * momentumScale;
                const momentumVy = this.vy * momentumScale;
                
                // Add new velocity from attraction
                this.vx = momentumVx + newVx;
                this.vy = momentumVy + newVy;
                
                // Apply repulsion if enabled
                if (CONFIG.repulsionStrength > 0) {
                    const repulsionForce = CONFIG.repulsionStrength * (1 - distance / CONFIG.attractionDistance);
                    this.vx -= (dx / distance) * repulsionForce;
                    this.vy -= (dy / distance) * repulsionForce;
                }
            }
        }

        // Apply general momentum (for non-cursor movement)
        if (distance >= CONFIG.attractionDistance) {
            // Scale velocity by current speed and momentum
            this.vx = this.vx * CONFIG.momentum + this.ax * currentSpeed;
            this.vy = this.vy * CONFIG.momentum + this.ay * currentSpeed;
        }

        // Apply friction
        this.vx *= (1 - CONFIG.friction);
        this.vy *= (1 - CONFIG.friction);

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Max travel distance behavior with momentum
        if (distanceFromStart > CONFIG.maxTravelDistance) {
            // Calculate return force to starting position
            const returnDx = this.startX - this.x;
            const returnDy = this.startY - this.y;
            const returnDist = Math.sqrt(returnDx * returnDx + returnDy * returnDy);
            
            if (returnDist > 0) {
                // Apply stronger return force based on how far past max distance
                const returnForce = 0.05 * (distanceFromStart - CONFIG.maxTravelDistance) / CONFIG.maxTravelDistance;
                this.ax += (returnDx / returnDist) * returnForce;
                this.ay += (returnDy / returnDist) * returnForce;
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