class PatternVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isVisible = false;
        this.points = [];
        this.lines = [];
        if (!ctx) {
            this.generatePatternPoints();
        }
    }

    generatePatternPoints() {
        this.points = [];
        this.lines = [];
        const numPoints = 100; // Number of points to visualize pattern

        switch(CONFIG.pattern) {
            case 'spiral':
                this.generateSpiralPattern(numPoints);
                break;
            case 'target':
                this.generateTargetPattern(numPoints);
                break;
            case 'grid':
                this.generateGridPattern();
                break;
            case 'triangle':
                this.generateTrianglePattern();
                break;
            case 'mandelbrot':
                this.generateMandelbrotPattern(numPoints);
                break;
        }
    }

    generateSpiralPattern(numPoints) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(this.canvas.width, this.canvas.height) / 4 * CONFIG.patternScale;

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 8;
            const radius = (i / numPoints) * maxRadius;
            const x = centerX + Math.cos(angle * 3) * radius;
            const y = centerY + Math.sin(angle * 3) * radius;
            this.points.push({x, y});
            
            if (i > 0) {
                this.lines.push({
                    from: this.points[i-1],
                    to: this.points[i]
                });
            }
        }
    }

    generateTargetPattern(numPoints) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(this.canvas.width, this.canvas.height) / 4 * CONFIG.patternScale;
        
        // Generate concentric circles
        for (let i = 0; i < 8; i++) {
            const radius = (i + 1) * maxRadius / 8;
            for (let j = 0; j < numPoints/8; j++) {
                const angle = (j / (numPoints/8)) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                this.points.push({x, y});
                
                if (j > 0) {
                    this.lines.push({
                        from: this.points[this.points.length-2],
                        to: this.points[this.points.length-1]
                    });
                }
            }
        }
    }

    generateGridPattern() {
        const cellSize = 50 * CONFIG.patternScale;
        const cols = Math.floor(this.canvas.width / cellSize);
        const rows = Math.floor(this.canvas.height / cellSize);

        // Generate grid points
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * cellSize + cellSize/2;
                const y = row * cellSize + cellSize/2;
                this.points.push({x, y});
                
                // Add horizontal lines
                if (col > 0) {
                    this.lines.push({
                        from: {x: x - cellSize, y},
                        to: {x, y}
                    });
                }
                // Add vertical lines
                if (row > 0) {
                    this.lines.push({
                        from: {x, y: y - cellSize},
                        to: {x, y}
                    });
                }
            }
        }
    }

    generateTrianglePattern() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = this.canvas.width/4 * CONFIG.patternScale;
        
        // Define triangle vertices
        const vertices = [
            {x: centerX, y: centerY - size},
            {x: centerX - size, y: centerY + size},
            {x: centerX + size, y: centerY + size}
        ];
        
        // Add vertices to points
        this.points.push(...vertices);
        
        // Add triangle edges to lines
        this.lines.push(
            {from: vertices[0], to: vertices[1]},
            {from: vertices[1], to: vertices[2]},
            {from: vertices[2], to: vertices[0]}
        );
        
        // Add some internal lines for visualization
        for (let i = 1; i < 5; i++) {
            const ratio = i / 5;
            this.lines.push(
                {
                    from: this.interpolate(vertices[0], vertices[1], ratio),
                    to: this.interpolate(vertices[1], vertices[2], ratio)
                },
                {
                    from: this.interpolate(vertices[1], vertices[2], ratio),
                    to: this.interpolate(vertices[2], vertices[0], ratio)
                },
                {
                    from: this.interpolate(vertices[2], vertices[0], ratio),
                    to: this.interpolate(vertices[0], vertices[1], ratio)
                }
            );
        }
    }

    generateMandelbrotPattern(numPoints) {
        const points = [];
        while (points.length < numPoints) {
            const pos = MandelbrotGenerator.generateParticlePosition(this.canvas);
            if (pos) {
                points.push(pos);
            }
        }
        
        this.points = points;
        
        // Connect nearby points
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 50) {
                    this.lines.push({from: points[i], to: points[j]});
                }
            }
        }
    }

    interpolate(p1, p2, ratio) {
        return {
            x: p1.x + (p2.x - p1.x) * ratio,
            y: p1.y + (p2.y - p1.y) * ratio
        };
    }

    draw() {
        if (!this.isVisible) return;

        // Draw pattern distance range indicator
        const maxOffset = (CONFIG.patternDistance / 100) * 50;
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = maxOffset * 2;
        this.ctx.beginPath();
        this.lines.forEach(line => {
            this.ctx.moveTo(line.from.x, line.from.y);
            this.ctx.lineTo(line.to.x, line.to.y);
        });
        this.ctx.stroke();

        // Draw lines
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.lines.forEach(line => {
            this.ctx.moveTo(line.from.x, line.from.y);
            this.ctx.lineTo(line.to.x, line.to.y);
        });
        this.ctx.stroke();

        // Draw points
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        this.points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.generatePatternPoints();
        }
        return this.isVisible;
    }
} 