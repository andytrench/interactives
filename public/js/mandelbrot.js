class MandelbrotGenerator {
    static calculate(x, y, maxIterations) {
        let real = x;
        let imaginary = y;
        let i;

        for (i = 0; i < maxIterations; i++) {
            const tempReal = real * real - imaginary * imaginary + x;
            imaginary = 2 * real * imaginary + y;
            real = tempReal;

            if (real * real + imaginary * imaginary > 4) {
                break;
            }
        }

        return i;
    }

    static generateParticlePosition(canvas) {
        const zoomFactor = 0.001 / CONFIG.zoom;
        const x = CONFIG.seahorseX + (Math.random() * 2 - 1) * zoomFactor;
        const y = CONFIG.seahorseY + (Math.random() * 2 - 1) * zoomFactor;
        const m = this.calculate(x, y, CONFIG.maxIterations);
        
        if (m < CONFIG.maxIterations) {
            const size = Math.max(0.5, (CONFIG.maxIterations - m) / CONFIG.maxIterations * 3);
            const hue = CONFIG.colorfulMode ? (m / CONFIG.maxIterations) * 360 : 180;
            const color = `hsl(${hue}, 100%, 50%)`;
            const screenX = (x - CONFIG.seahorseX) / zoomFactor * canvas.width / 2 + canvas.width / 2;
            const screenY = (y - CONFIG.seahorseY) / zoomFactor * canvas.height / 2 + canvas.height / 2;
            
            return { x: screenX, y: screenY, size, color };
        }
        
        return null;
    }
} 