const Team = require("../models/Team");

const verifyTeamMembership = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    if (!teamId) return res.status(400).json({ error: "Team ID is required" });

    const userId = req.user._id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const isMember = team.members.some(m => String(m.userId) === String(userId));

    // Admins bypass membership check
    if (!isMember && req.user.role !== "admin") {
      return res.status(403).json({ error: "You are not a member of this team" });
    }

    req.team = team; // attach team to request
    next();
  } catch (err) {
    console.error("Membership check error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = verifyTeamMembership;
