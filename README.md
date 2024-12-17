# Plexus Effect Sandbox

An interactive particle system visualization tool that creates mesmerizing plexus-like effects with customizable patterns and behaviors. This project provides a sandbox environment for experimenting with particle animations, force interactions, and pattern generation.


## Overview

The Plexus Effect Sandbox creates dynamic particle animations where particles follow patterns, respond to cursor movement, and form connections with nearby particles. The system uses momentum-based physics and customizable forces to create fluid, organic-looking animations.

## Core Mechanics

### Particle Behavior
- Particles are born at pattern-defined positions
- Each particle has momentum and responds to forces
- Particles try to stay within their maximum travel distance from birth position
- Higher momentum (0.900-1.001) creates more fluid, continuous movement
- Lower momentum creates more responsive, direct movement

### Connection System
- Particles form line connections when within connection distance
- Connection opacity fades based on:
  - Distance between particles (closer = more opaque)
  - Connection fade speed (higher = faster fade)
  - Particle lifecycle state
- Persistent connections option maintains connections until particles are too far apart

### Force Interactions
- Cursor creates an attraction/repulsion field
- Attraction pulls particles toward cursor:
  - Higher values (1.0-2.0) create strong clustering
  - Lower values (0.1-0.5) create subtle movement
- Repulsion pushes particles away:
  - Higher values create strong dispersion
  - Useful for breaking up dense clusters
- Force range determines the radius of effect
- Attraction momentum controls how much velocity particles maintain

## Pattern Effects

### Mandelbrot
- Creates fractal-based distribution
- Higher zoom focuses on detail areas
- Best with medium particle counts (500-1000)

### Spiral
- Creates flowing spiral formations
- Pattern scale affects spiral density
- Works well with high momentum
- Best for attraction-based interactions

### Grid
- Creates uniform particle distribution
- Good for testing force interactions
- Pattern scale controls grid density
- Works well with connection effects

### Target (Concentric)
- Creates circular ring formations
- Good for ripple-like effects
- Works well with repulsion forces

### Triangle
- Creates triangular distribution
- Good for testing directional forces
- Pattern scale affects triangle size

## Visual Settings Guide

### Performance vs. Quality
- Particle Count:
  - 100-500: Smooth performance, sparse connections
  - 500-1000: Balanced visuals and performance
  - 1000-5000: Dense connections, may impact performance

- Connection Distance:
  - 50-100: Minimal connections, best performance
  - 100-200: Balanced connection density
  - 200+: Dense network, higher GPU usage

### Visual Effects
- Line Thickness:
  - 0.1-1.0: Subtle, web-like connections
  - 1.0-3.0: Bold, prominent lines
  - 3.0-5.0: Thick, glowing connections

- Particle Size:
  - 0.1-2.0: Small, star-like points
  - 2.0-5.0: Medium, visible nodes
  - 5.0+: Large, dominant particles

## Installation

1. Clone the repository:
```git clone https://github.com/yourusername/plexus-effect-sandbox.git```

2. Install dependencies:
```npm install```

3. Start the server:
```python start_server.py```

4. Open in browser:
```http://localhost:3000```

## Project Structure
```
├── public/
│   ├── js/
│   │   ├── particle.js       # Particle physics & behavior
│   │   ├── patterns.js       # Pattern generation algorithms
│   │   ├── renderer.js       # Canvas rendering engine
│   │   ├── mandelbrot.js     # Mandelbrot set calculations
│   │   └── settings-manager.js# Configuration management
│   ├── loadSet/             # Default configuration
│   ├── examples/            # Preset examples
│   └── styles.css          # UI styling
├── start_server.py         # Python development server
└── package.json           # Project configuration
```

## Performance Tips
- Reduce particle count for smoother animation
- Lower connection distance to reduce line rendering
- Disable persistent connections for better performance
- Use smaller particle sizes to reduce GPU load
- Consider disabling glow effects on slower devices

## License
This project is licensed under the MIT License