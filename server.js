const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
    );
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Ensure directories exist
const paramsDir = path.join(__dirname, 'params');
const settingsDir = path.join(__dirname, 'public', 'settings');
const defaultSettingsPath = path.join(settingsDir, 'default-settings.json');

app.use(async (req, res, next) => {
    try {
        await fs.mkdir(paramsDir, { recursive: true });
        await fs.mkdir(settingsDir, { recursive: true });
        
        // Create default settings file if it doesn't exist
        if (!await fs.access(defaultSettingsPath).catch(() => false)) {
            await fs.writeFile(defaultSettingsPath, JSON.stringify(CONFIG, null, 2));
        }
    } catch (error) {
        console.error('Error creating directories:', error);
    }
    next();
});

// Save settings endpoint
app.post('/save-settings', async (req, res) => {
    try {
        const { name, settings } = req.body;
        const filename = path.join(paramsDir, `${name}.json`);
        await fs.writeFile(filename, JSON.stringify(settings, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Load settings endpoint
app.get('/load-settings', async (req, res) => {
    try {
        const { name } = req.query;
        const filename = path.join(paramsDir, `${name}.json`);
        const data = await fs.readFile(filename, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Load error:', error);
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

// List settings files endpoint
app.get('/list-settings', async (req, res) => {
    try {
        const files = await fs.readdir(paramsDir);
        res.json(files.filter(file => file.endsWith('.json')));
    } catch (error) {
        console.error('List error:', error);
        res.status(500).json({ error: 'Failed to list settings' });
    }
});

// Add this endpoint to list files in examples directory
app.get('/examples/list', async (req, res) => {
    try {
        const examplesDir = path.join(__dirname, 'public', 'examples');
        console.log('Examples directory:', examplesDir);
        // Ensure examples directory exists
        await fs.mkdir(examplesDir, { recursive: true });
        const files = await fs.readdir(examplesDir);
        console.log('Found files:', files);
        res.json(files);
    } catch (error) {
        console.error('Error listing examples:', error);
        console.error('Full error:', error.stack);
        // Return empty array instead of error if directory is empty or doesn't exist
        res.json([]);
    }
});

// Serve example files - move this before the catch-all route
app.use('/examples', express.static(path.join(__dirname, 'public', 'examples')));

// Serve settings files
app.use('/settings', express.static(path.join(__dirname, 'public', 'settings')));

// Add a catch-all route to serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
