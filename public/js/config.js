// Default configuration values
const CONFIG = {
    // Particle settings
    particleCount: 600,
    particleSize: 1,
    fadeSpeed: 0.001,
    
    // Connection settings
    connectionDistance: 200,
    lineThickness: 2.5,
    connectionFadeSpeed: 0.01,
    
    // Force settings
    attractionStrength: 0,
    attractionDistance: 240,
    repulsionStrength: 0,
    
    // Mandelbrot settings
    maxIterations: 100,
    zoom: 1,
    seahorseX: -0.745,
    seahorseY: 0.1,
    
    // Visual modes
    fullMatrixMode: false,
    colorfulMode: false,
    persistentConnections: false,
    
    // New config options
    glowIntensity: 0.5,
    minOpacity: 0.1,
    maxOpacity: 0.8,
    
    // Particle lifecycle settings
    particleSpawnRate: 10, // Particles to spawn per frame
    minParticleLife: 0.5,
    maxParticleLife: 2.0,
    fadeInDuration: 0.2, // 20% of life spent fading in
    fadeOutDuration: 0.3, // 30% of life spent fading out
    
    // Add to existing CONFIG object
    particleColor: '#00ffff',
    particleOpacity: 100,
    lineColor: '#00ffff',
    lineOpacity: 15,
    
    // Pattern settings
    pattern: 'mandelbrot', // 'mandelbrot', 'spiral', 'target', 'grid', 'triangle'
    patternScale: 1,
    patternDistance: 50, // How far particles can spawn from pattern lines (1-100)
}; 