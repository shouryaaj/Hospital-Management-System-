import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., failed-login
  email: { type: String },
  ip: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
