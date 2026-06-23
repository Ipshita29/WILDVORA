const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role:   { type: String, enum: ['customer', 'operator'], required: true },
    text:   { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const inquirySchema = new mongoose.Schema(
  {
    experience: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true },
    customer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    host:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages:   [messageSchema],
  },
  { timestamps: true }
);

// One inquiry thread per customer per experience
inquirySchema.index({ experience: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
