const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  voterID: {
    type: String,
    required: true,
    unique: true, 
  },
  voterfingerprintID: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('Voter', voterSchema);
