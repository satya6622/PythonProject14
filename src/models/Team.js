const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, role: { type: String, enum: ['owner', 'member'], default: 'member' } }]
}, { timestamps: true });
module.exports = mongoose.model('Team', teamSchema);
