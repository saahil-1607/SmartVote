const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminID: {
    type: String,
    required: true,
    unique: true, 
  },
  password: {
    type: String,
    required: true,
  },
  fingerprintID: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('Admin', adminSchema);
