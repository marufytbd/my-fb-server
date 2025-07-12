const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// In-memory story list (for demo; use DB in production)
let stories = [];

// Upload API
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  const story = {
    url,
    time: Date.now(),
    user: req.body.user || 'Anonymous',
    type: req.file.mimetype // <-- send the real MIME type
  };
  stories.push(story);
  res.json(story);
});

// Stories list API
app.get('/stories', (req, res) => {
  const now = Date.now();
  // Remove expired stories (older than 12 hours)
  stories = stories.filter(s => now - s.time < 12 * 60 * 60 * 1000);
  res.json(stories);
});

// Add this endpoint to delete all stories
app.delete('/stories', (req, res) => {
  stories = [];
  res.json({ success: true, message: 'All stories deleted.' });
});

app.listen(PORT, () => console.log('Server running on port', PORT)); 