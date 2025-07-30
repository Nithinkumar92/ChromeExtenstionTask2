const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name: String,
  location: String,
  bio: String,
  followers: Number,
  connections: Number,
  url: String
});

module.exports = mongoose.model('Profile', ProfileSchema);