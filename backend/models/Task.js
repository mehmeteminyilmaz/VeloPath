const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  id:        { type: String, required: true },
  title:     { type: String },
  text:      { type: String },
  completed: { type: Boolean, default: false }
});

const commentSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text:     { type: String, required: true },
}, { timestamps: true });

const recurrenceSchema = new mongoose.Schema({
  type:      { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  interval:  { type: Number, default: 1 },
  lastReset: { type: Date, default: null },
}, { _id: false });

const taskSchema = new mongoose.Schema({
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title:       { type: String, required: true },
  status:      { type: String, default: 'todo', enum: ['todo', 'in-progress', 'done'] },
  priority:    { type: String, default: 'medium', enum: ['low', 'medium', 'high'] },
  completedAt: { type: Date },
  dueDate:     { type: Date, default: null },
  recurrence:  { type: recurrenceSchema, default: null },
  tags:        [{ type: String }],
  notes:       { type: String, default: '' },
  comments:    [commentSchema],
  subtasks:    [subtaskSchema],
  dependencies:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  isLocked:    { type: Boolean, default: false },
  weekIndex:   { type: Number, default: 0 },
  orderIndex:  { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
