const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, default: "Task" },
  description: { type: String, default: "" },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, default: 0 },
  earn: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "requested", "approved", "rejected", "in_progress", "completed"], default: "pending" },
  approvedByManager: { type: Boolean, default: false },
  approvedBySupervisor: { type: Boolean, default: false },
  approvedByOwner: { type: Boolean, default: false },
  dueDate: { type: Date },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);


