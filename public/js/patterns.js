class PatternGenerator {
    static generatePosition(canvas) {
        // Get pattern lines from visualizer
        const visualizer = new PatternVisualizer(canvas, null);
        visualizer.generatePatternPoints();
        const patternLines = visualizer.lines;
        
        // Maximum attempts to find a valid position
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const position = this.generatePatternPosition(canvas);
            if (!position) return null;
            
            // Find minimum distance to any pattern line
            const minDistance = this.findMinDistanceToPattern(position, patternLines);
            const maxOffset = (CONFIG.patternDistance / 100) * 50;
            
            // Accept position if within pattern distance
            if (minDistance <= maxOffset) {
                return position;
            }
            
            attempts++;
        }
        
        // If we couldn't find a valid position, return null
        return null;
    }

    static findMinDistanceToPattern(point, lines) {
        if (!lines || lines.length === 0) return 0;
        
        let minDistance = Infinity;
        
        for (const line of lines) {
            const distance = this.pointToLineDistance(
                point,
                line.from,
                line.to
            );
            minDistance = Math.min(minDistance, distance);
        }
        
        return minDistance;
    }

    static pointToLineDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }

    static generatePatternPosition(canvas) {
        switch(CONFIG.pattern) {
            case 'spiral':
                return this.generateSpiral(canvas);
            case 'target':
                return this.generateTargetPattern(canvas);
            case 'grid':
                return this.generateGrid(canvas);
            case 'triangle':
                return this.generateTriangle(canvas);
            default:
                return MandelbrotGenerator.generateParticlePosition(canvas);
        }
    }

    static generateSpiral(canvas) {
        const angle = Math.random() * Math.PI * 2 * CONFIG.patternScale;
        const radius = (Math.random() * canvas.width/4) * CONFIG.patternScale;
        return {
            x: canvas.width/2 + Math.cos(angle * 3) * radius,
            y: canvas.height/2 + Math.sin(angle * 3) * radius,
            size: 1,
            color: CONFIG.dotColor
        };
    }

    static generateTargetPattern(canvas) {
        const centerX = canvas.width/2;
        const centerY = canvas.height/2;
        const maxRadius = Math.min(canvas.width, canvas.height)/4 * CONFIG.patternScale;
        
        // Generate a point on a random circle
        const numCircles = 8;
        const circleIndex = Math.floor(Math.random() * numCircles);
        const radius = ((circleIndex + 1) * maxRadius / numCircles);
        
        // Generate point at random angle on the selected circle
        const angle = Math.random() * Math.PI * 2;
        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            size: 1,
            color: CONFIG.dotColor
        };
    }

    static generateGrid(canvas) {
        const baseSize = 50 * CONFIG.patternScale;
        const cols = Math.max(2, Math.ceil(canvas.width / baseSize));
        const rows = Math.max(2, Math.ceil(canvas.height / baseSize));
        
        // Adjust cell size to fill canvas
        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / rows;
        
        const col = Math.floor(Math.random() * cols);
        const row = Math.floor(Math.random() * rows);
        
        return {
            x: col * cellWidth + Math.random() * cellWidth,
            y: row * cellHeight + Math.random() * cellHeight,
            size: 1,
            color: CONFIG.dotColor
        };
    }

    static generateTriangle(canvas) {
        const size = canvas.width/2 * CONFIG.patternScale;
        const points = [
            {x: canvas.width/2, y: canvas.height/2 - size},
            {x: canvas.width/2 - size, y: canvas.height/2 + size},
            {x: canvas.width/2 + size, y: canvas.height/2 + size}
        ];
        
        // Random barycentric coordinates
        const a = Math.random();
        const b = Math.random() * (1 - a);
        const c = 1 - a - b;
        
        return {
            x: points[0].x * a + points[1].x * b + points[2].x * c,
            y: points[0].y * a + points[1].y * b + points[2].y * c,
            size: 1,
            color: CONFIG.dotColor
        };
    }
} 