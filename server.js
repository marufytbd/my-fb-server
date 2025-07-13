const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

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

// In-memory storage (for demo; use DB in production)
let stories = [];
let posts = [];

// Upload story API
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const url = `https://my-fb-server-1.onrender.com/uploads/${req.file.filename}`;
    const story = {
      id: Date.now(),
      url,
      time: Date.now(),
      user: req.body.user || 'Anonymous',
      type: req.file.mimetype
    };
    stories.push(story);
    res.json(story);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload post API
app.post('/post', upload.single('file'), (req, res) => {
  try {
    const post = {
      id: Date.now(),
      text: req.body.text || '',
      user: req.body.user || 'Anonymous',
      time: Date.now()
    };
    
    if (req.file) {
      post.fileUrl = `https://my-fb-server-1.onrender.com/uploads/${req.file.filename}`;
      post.fileType = req.file.mimetype;
    }
    
    posts.push(post);
    res.json(post);
  } catch (error) {
    console.error('Post upload error:', error);
    res.status(500).json({ error: 'Post upload failed' });
  }
});

// Stories list API
app.get('/stories', (req, res) => {
  try {
    const now = Date.now();
    // Remove expired stories (older than 12 hours)
    stories = stories.filter(s => now - s.time < 12 * 60 * 60 * 1000);
    res.json(stories);
  } catch (error) {
    console.error('Stories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// Posts list API
app.get('/posts', (req, res) => {
  try {
    res.json(posts);
  } catch (error) {
    console.error('Posts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Delete all stories
app.delete('/stories', (req, res) => {
  try {
    stories = [];
    res.json({ success: true, message: 'All stories deleted.' });
  } catch (error) {
    console.error('Delete stories error:', error);
    res.status(500).json({ error: 'Failed to delete stories' });
  }
});

// Delete all posts
app.delete('/posts', (req, res) => {
  try {
    posts = [];
    res.json({ success: true, message: 'All posts deleted.' });
  } catch (error) {
    console.error('Delete posts error:', error);
    res.status(500).json({ error: 'Failed to delete posts' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: Date.now() });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 