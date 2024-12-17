# Plexus Effect Sandbox

An interactive particle system visualization tool that creates mesmerizing plexus-like effects with customizable patterns and behaviors.

![Plexus Effect Demo](examples/Red%20Grid%202.jpg)

## Features

### Particle System
- Dynamic particle generation and lifecycle management
- Customizable particle properties:
  - Count (100-5000 particles)
  - Size (0.1-20 pixels)
  - Fade speed (0.0001-0.02)
  - Travel distance (1-500 pixels)
  - Movement speed (0.1-5)
  - Momentum (0.900-1.001)
  - Friction (0-0.1)

### Connection System
- Intelligent particle connection management
- Adjustable properties:
  - Connection distance (10-1000 pixels)
  - Line thickness (0.1-5 pixels)
  - Connection fade speed
  - Persistent connections option

### Force System
- Interactive cursor-based forces:
  - Attraction (0-2.0)
  - Repulsion (0-2.0)
  - Force range (10-500 pixels)
  - Attraction momentum (0-1)

### Pattern Generation
Built-in patterns:
- Mandelbrot Set
- Spiral
- Concentric Circles
- Grid
- Triangle

Pattern controls:
- Scale adjustment
- Distance control
- Pattern visualization toggle

### Visual Customization
- Full Matrix Mode
- Colorful Mode
- Particles on Top option
- Color controls:
  - Particle color & opacity
  - Line color & opacity
  - Custom color picker

### Settings Management
- Save/Load functionality
- Preset system with thumbnails
- Example presets included
- JSON-based configuration

## Technical Details

### Requirements
- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- Recommended: GPU acceleration for smooth performance

### Installation

1. Clone the repository: 