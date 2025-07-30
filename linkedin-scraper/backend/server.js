const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Profile = require('./models/Profile');

const app = express();

// Add explicit CORS headers for debugging
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  next();
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.post('/api/profiles', async (req, res) => {
  try {
    const { name, location, bio, followers, connections, url } = req.body;
    const profile = new Profile({ name, location, bio, followers, connections, url });
    await profile.save();
    res.status(201).json({ message: 'Profile saved!', profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save', details: err.message });
  }
});

app.listen(5050, () => console.log('Server running on port 5050'));