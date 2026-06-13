const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
// Render will inject your MongoDB connection string here
const MONGODB_URI = process.env.MONGODB_URI; 

// Middleware
app.use(cors());
app.use(express.json());
// Serve the frontend file from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB cluster.'))
    .catch(err => console.error('MongoDB connection error:', err));

// Database Schema & Model
const fileSchema = new mongoose.Schema({
    fileName: { type: String, required: true, unique: true },
    code: { type: String, default: '' },
    modified: { type: String, required: true }
});

const File = mongoose.model('File', fileSchema);

// --- API Endpoints ---

// Save or Update File
app.post('/api/files', async (req, res) => {
    try {
        const { fileName, code, modified } = req.body;
        // Upsert creates the file if it doesn't exist, or updates it if it does
        const file = await File.findOneAndUpdate(
            { fileName },
            { code, modified },
            { new: true, upsert: true }
        );
        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ error: 'Failed to write data record.' });
    }
});

// Retrieve All Files
app.get('/api/files', async (req, res) => {
    try {
        // Exclude the heavy code payload here for faster directory loading
        const files = await File.find({}, 'fileName modified').sort({ modified: -1 });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve directory.' });
    }
});

// Retrieve Target File Details
app.get('/api/files/:name', async (req, res) => {
    try {
        const file = await File.findOne({ fileName: req.params.name });
        if (!file) return res.status(404).json({ error: 'File not found.' });
        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load file payload.' });
    }
});

// Delete Target File
app.delete('/api/files/:name', async (req, res) => {
    try {
        await File.findOneAndDelete({ fileName: req.params.name });
        res.status(200).json({ message: 'Record permanently deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to execute deletion protocol.' });
    }
});

// Start Server Runtime
app.listen(PORT, () => {
    console.log(`Studio.io API Server actively listening on port ${PORT}`);
});
