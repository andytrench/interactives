const express = require('express');
const path = require('path');
const app = express();

// Set correct MIME types
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

// Add near the top of the file, after the middleware setup
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

// Handle API routes here if needed
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Add this route near your other routes
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        version: process.env.npm_package_version,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Vercel will handle the port
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
