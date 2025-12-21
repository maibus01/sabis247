const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["owner","manager","employee","supervisor"] }
      }
    ]
  },
  { timestamps: true }
);

// ========================
// INSTANCE METHODS
// ========================

// Get all members with a specific role
teamSchema.methods.getMembersByRole = function(role) {
  return this.members.filter(m => m.role === role).map(m => m.userId);
};

// Get owner
teamSchema.methods.getOwner = function() {
  const owner = this.members.find(m => m.role === "owner");
  return owner ? owner.userId : null;
};

// Get manager
teamSchema.methods.getManager = function() {
  const manager = this.members.find(m => m.role === "manager");
  return manager ? manager.userId : null;
};

// Get all supervisors
teamSchema.methods.getSupervisors = function() {
  return this.members.filter(m => m.role === "supervisor").map(m => m.userId);
};

// Get all employees
teamSchema.methods.getEmployees = function() {
  return this.members.filter(m => m.role === "employee").map(m => m.userId);
};

module.exports = mongoose.model("Team", teamSchema);
