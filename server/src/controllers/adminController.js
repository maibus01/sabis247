const User = require("../models/User");
const Team = require("../models/Team");
const Task = require("../models/Task");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate("members.userId", "name email");
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate("members.userId", "name email role");

    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch team" });
  }
};


exports.getSystemStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const teams = await Team.countDocuments();
    const tasks = await Task.countDocuments();

    res.json({ users, teams, tasks });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};


// Toggle user active/disabled
exports.toggleUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user first
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Toggle isActive without triggering validation on other fields
    await User.updateOne(
      { _id: id },
      { $set: { isActive: !user.isActive } }
    );

    return res.json({ message: `User is now ${!user.isActive ? "Active" : "Disabled"}` });
  } catch (err) {
    console.error("Toggle user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
