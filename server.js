const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('.'));

// Ensure params directory exists
const paramsDir = path.join(__dirname, 'params');
fs.mkdir(paramsDir, { recursive: true }).catch(console.error);

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
