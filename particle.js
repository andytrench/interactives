class Particle {
    constructor(x, y, size, color, initialLife = 1, maxLife = 2) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = 0.3 + Math.random() * 0.3;
        this.angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        
        // New lifecycle properties
        this.life = initialLife;
        this.maxLife = maxLife;
        this.fadeInDuration = 0.2; // Time to fade in (as fraction of maxLife)
        this.fadeOutDuration = 0.3; // Time to fade out (as fraction of maxLife)
        
        // Calculate alpha based on life stage
        this.alpha = this.calculateAlpha();
        
        this.connections = new Set();
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
        // Mouse attraction/repulsion
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < CONFIG.attractionDistance) {
                const force = (CONFIG.attractionDistance - distance) / CONFIG.attractionDistance;
                this.vx += (dx / distance) * CONFIG.attractionStrength * force - 
                          (dx / distance) * CONFIG.repulsionStrength;
                this.vy += (dy / distance) * CONFIG.attractionStrength * force - 
                          (dy / distance) * CONFIG.repulsionStrength;
            }
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;
        this.life -= CONFIG.fadeSpeed;

        // Update lifecycle
        this.alpha = this.calculateAlpha();

        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Apply friction
        this.vx *= 0.99;
        this.vy *= 0.99;

        return this.life > 0;
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