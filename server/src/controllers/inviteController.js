const Invite = require("../models/Invite");
const Team = require("../models/Team");
const crypto = require("crypto");

// Create an invite
exports.createInvite = async (req, res) => {
  try {
    const { teamId, role } = req.body;
    const createdBy = req.user._id; // automatically use logged-in user

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    // Role-based invite rules
    const owner = team.members.find(m => m.role === "owner");
    const manager = team.members.find(m => m.role === "manager");
    const isOwner = String(createdBy) === String(owner.userId);
    const isManager = manager && String(createdBy) === String(manager.userId);

    if (role === "manager" && !isOwner) {
      return res.status(403).json({ error: "Only owner can invite a manager" });
    }
    if (role === "supervisor" && !(isOwner)) {
      return res.status(403).json({ error: "Only owner can invite supervisor" });
    }
    if (role === "employee" && !(isOwner || isManager)) {
      return res.status(403).json({ error: "Only owner or manager can invite employee" });
    }

    // Only one manager allowed
    if (role === "manager" && manager) {
      return res.status(400).json({ error: "Team already has a manager" });
    }

    const code = crypto.randomBytes(4).toString("hex");

    const invite = await Invite.create({
      team: teamId,
      role,
      code,
      createdBy
    });

    res.status(201).json({ code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// JOIN TEAM
exports.joinTeam = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    if (!code) return res.status(400).json({ error: "Invite code required" });

    const invite = await Invite.findOne({ code });
    if (!invite) return res.status(404).json({ error: "Invalid invite code" });
    if (invite.used) return res.status(400).json({ error: "Invite already used" });
    if (invite.expiresAt < Date.now()) return res.status(400).json({ error: "Invite expired" });

    const team = await Team.findById(invite.team);
    if (!team) return res.status(404).json({ error: "Team not found" });

    // Check if already a member
    const allMembers = [
      team.getOwner(),
      team.getManager(),
      ...team.getSupervisors(),
      ...team.getEmployees()
    ].map(id => String(id));

    if (allMembers.includes(String(userId))) {
      return res.status(400).json({ error: "You are already a member of this team" });
    }

    // Add user to team
    team.members.push({ userId, role: invite.role });
    await team.save();

    // Mark invite as used
    invite.used = true;
    await invite.save();

    res.json({ message: "Joined team successfully", teamId: team._id, role: invite.role });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
