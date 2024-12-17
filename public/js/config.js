// Default configuration values
const CONFIG = {
    // Particle settings
    particleCount: 2200,
    particleSize: 8.8,
    fadeSpeed: 0.001,  // Range: 0.0001 to 0.01
    
    // Connection settings
    connectionDistance: 190,
    lineThickness: 0.9,
    connectionFadeSpeed: 0.024,
    
    // Force settings
    attractionStrength: 0.04,
    attractionDistance: 270,
    repulsionStrength: 0.02,
    
    // Mandelbrot settings
    maxIterations: 120,
    zoom: 23,
    seahorseX: -0.745,
    seahorseY: 0.1,
    
    // Visual modes
    fullMatrixMode: false,
    colorfulMode: false,
    persistentConnections: false,
    particlesOnTop: true,
    
    // Visual settings
    glowIntensity: 0.5,
    minOpacity: 0.1,
    maxOpacity: 0.8,
    
    // Particle lifecycle settings
    particleSpawnRate: 10,
    minParticleLife: 0.5,
    maxParticleLife: 2.0,
    fadeInDuration: 0.2,
    fadeOutDuration: 0.3,
    
    // Color settings
    particleColor: '#9437ff',
    particleOpacity: 100,
    lineColor: '#00f900',
    lineOpacity: 100,
    dotColor: '#00ffff',
    dotOpacity: 100,
    
    // Pattern settings
    pattern: 'mandelbrot',
    patternScale: 1.5,
    patternDistance: 26,
    
    // Particle movement settings
    maxTravelDistance: 100,  // Maximum distance a particle can travel
    travelSpeed: 0.5,       // Speed at which particles travel
    momentum: 0.900,        // Default momentum (range: 0.900 to 1.001)
    friction: 0.02,         // How quickly particles slow down
}; 