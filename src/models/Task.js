const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 5000, default: '' },
  status: { type: String, enum: ['open', 'in_progress', 'completed'], default: 'open', index: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
  dueDate: { type: Date, default: null },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  attachments: [attachmentSchema]
}, { timestamps: true });
taskSchema.index({ team: 1, status: 1, dueDate: 1 });
module.exports = mongoose.model('Task', taskSchema);
