const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;
const BASE_URL = "https://my-fb-server-2.onrender.com";

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    // Always preserve original extension
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, Date.now() + '-' + base.replace(/[^a-zA-Z0-9_-]/g, '') + ext);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow image and video
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

// In-memory story list (for demo; use DB in production)
let stories = [];

// Upload API
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('Story upload body:', req.body);
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `${BASE_URL}/uploads/${req.file.filename}`;
  const story = {
    url,
    time: Date.now(),
    userName: req.body.userName || 'Anonymous',
    profileImage: req.body.profileImage || 'default-profile.png',
    type: req.file.mimetype
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

// In-memory post list (for demo; use DB in production)
let posts = [];

// Post Upload API
app.post('/post', upload.single('file'), (req, res) => {
  console.log('POST /post called');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  if (!req.file) {
    console.error('No file uploaded!');
    return res.status(400).json({ error: 'No file uploaded (debug: req.file is undefined)' });
  }
  // Extra: check mimetype again
  if (!(req.file.mimetype.startsWith('image/') || req.file.mimetype.startsWith('video/'))) {
    return res.status(400).json({ error: 'Only image and video files are allowed!' });
  }
  const url = `${BASE_URL}/uploads/${req.file.filename}`;
  const post = {
    url,
    time: Date.now(),
    user: req.body.user || 'Anonymous',
    name: req.body.user || 'Anonymous',
    profileImage: req.body.profileImage || 'default-profile.png',
    caption: req.body.caption || '',
    type: req.file.mimetype
  };
  posts.push(post);
  res.json(post);
});

// Posts list API
app.get('/posts', (req, res) => {
  res.json(posts);
});

// Delete all posts
app.delete('/posts', (req, res) => {
  posts = [];
  res.json({ success: true, message: 'All posts deleted.' });
});

// --- Profile Upload & Fetch APIs ---
const PROFILES_FILE = 'profiles.json';

// Helper: Load profiles from file
function loadProfiles() {
  try {
    if (!fs.existsSync(PROFILES_FILE)) return [];
    const data = fs.readFileSync(PROFILES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}
// Helper: Save profiles to file
function saveProfiles(profiles) {
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
}

// Profile image upload API
app.post('/upload-profile', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `${BASE_URL}/uploads/${req.file.filename}`;
  const { name, background } = req.body;
  let profiles = loadProfiles();
  let idx = profiles.findIndex(p => p.name === name);
  let profile;
  if (background === '1') {
    // Cover photo upload
    profile = {
      ...(profiles[idx] || {}),
      name: name || 'Anonymous',
      background: url,
      updated: Date.now()
    };
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile };
    } else {
      profiles.push(profile);
    }
    saveProfiles(profiles);
    return res.json({ background: url });
  } else {
    // Profile image upload
    profile = {
      name: name || 'Anonymous',
      profileImage: url,
      background: (profiles[idx] && profiles[idx].background) || '',
      updated: Date.now()
    };
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile };
    } else {
      profiles.push(profile);
    }
    saveProfiles(profiles);
    return res.json(profile);
  }
});

// Get all profiles
app.get('/profiles', (req, res) => {
  const profiles = loadProfiles();
  res.json(profiles);
});

app.listen(PORT, () => console.log('Server running on port', PORT));