const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },

  role: {
    type: String,
    enum: ["manager", "supervisor", "employee"],
    required: true,
  },

  code: {
    type: String,
    unique: true,
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  expiresAt: {
    type: Date,
    default: () => Date.now() + 7 * 24 * 60 * 60 * 1000, // expires in 7 days
  },

  used: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Invite", inviteSchema);
