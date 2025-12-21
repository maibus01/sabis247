const mongoose = require("mongoose");

const Team = require("../models/Team");
const Invite = require("../models/Invite");
const Task = require("../models/Task");

exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user._id; // from auth middleware

    const team = await Team.create({
      name,
      description,
      members: [{ userId: ownerId, role: "owner" }],
    });

    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserTeams = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch teams where the user is a member
    const teams = await Team.find({
      "members.userId": userId,
    })
      .populate("members.userId", "name email")
      .lean();

    // Normalize roles and get ownerName
    const cleanedTeams = teams.map((team) => {
      const owner = team.members.find((m) => m.role === "owner");
      return {
        ...team,
        ownerName: owner?.userId?.name || "Unknown",
        members: team.members.map((m) => ({
          ...m,
          role: m.role?.toLowerCase().trim(),
        })),
      };
    });

    res.json(cleanedTeams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching teams" });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate("members.userId", "name email photo") // populate member info
      .lean();

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Find owner from members
    const owner = team.members.find((m) => m.role === "owner");

    // Normalize members roles and attach ownerName
    const normalizedTeam = {
      ...team,
      ownerName: owner?.userId?.name || "Unknown",
      members: team.members.map((m) => ({
        ...m,
        role: m.role?.toLowerCase().trim(),
      })),
    };

    res.json(normalizedTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId).populate(
      "members.userId",
      "name email photo"
    );
    if (!team) return res.status(404).json({ error: "Team not found" });

    const members = team.members.map((m) => ({
      id: m.userId._id,
      fullName: m.userId.name,
      role: m.role,
      tasks: m.tasks || [], // optional
    }));

    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTeamTotals = async (req, res) => {
  const { teamId } = req.params;

  try {
    const tasks = await Task.find({ team: teamId, status: "approved" });

    const totalAmount = tasks.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalEarn = tasks.reduce((sum, t) => sum + (t.earn || 0), 0);
    const totalGift = tasks.reduce((sum, t) => sum + (t.gift || 0), 0);
    const totalTasks = tasks.length;

    const totalRevenue = totalAmount - totalEarn; // calculate revenue

    res.json({ totalAmount, totalEarn, totalGift, totalTasks, totalRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch totals" });
  }
};

exports.getEmployeeTotals = async (req, res) => {
  const { teamId } = req.params;

  try {
    // 1️⃣ Validate team exists
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    // 2️⃣ Get employees only
    const employees = team.members.filter((m) => m.role === "employee");

    // 3️⃣ Aggregate tasks for these employees
    const tasks = await Task.find({
      team: teamId,
      status: { $in: ["approved", "closed", "open"] }, // include all relevant statuses
    });

    // 4️⃣ Map totals per employee
    const employeeMap = {};
    tasks.forEach((t) => {
      const empId = t.assignedTo.toString();
      if (!employeeMap[empId]) {
        employeeMap[empId] = {
          employeeId: empId,
          totalAmount: 0,
          totalEarn: 0,
          totalTasks: 0,
        };
      }

      employeeMap[empId].totalAmount += t.amount || 0;
      employeeMap[empId].totalEarn += t.earn || 0;
      employeeMap[empId].totalTasks += 1;
    });

    // 5️⃣ Build final array for frontend
    const employeesTotals = employees.map((emp) => ({
      employeeId: emp.userId.toString(),
      totalAmount: employeeMap[emp.userId.toString()]?.totalAmount || 0,
      totalEarn: employeeMap[emp.userId.toString()]?.totalEarn || 0,
      totalTasks: employeeMap[emp.userId.toString()]?.totalTasks || 0,
    }));

    // 6️⃣ Optional team summary
    const summary = {
      totalAmount: tasks.reduce((s, t) => s + (t.amount || 0), 0),
      totalEarn: tasks.reduce((s, t) => s + (t.earn || 0), 0),
      totalTasks: tasks.length,
    };

    res.json({ employees: employeesTotals, summary });
  } catch (err) {
    console.error("EMPLOYEE TOTALS ERROR:", err);
    res.status(500).json({ error: "Failed to calculate totals" });
  }
};

exports.deleteTeam = async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user._id;

  console.log("DELETE request for team:", teamId, "by user:", userId);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Find the team
    const team = await Team.findById(teamId).session(session);

    if (!team) {
      console.log("Team not found:", teamId);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Team not found" });
    }

    // 2️⃣ Check if requester is owner
    const isOwner = team.members.some(
      (m) => m.userId.toString() === userId.toString() && m.role === "owner"
    );

    if (!isOwner) {
      console.log("User is not owner:", userId);
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ message: "Only owner can delete the team" });
    }

    // 3️⃣ Delete related data
    const deleteInvites = await Invite.deleteMany({ team: teamId }).session(
      session
    );
    const deleteTasks = await Task.deleteMany({ team: teamId }).session(
      session
    );
    const deleteTeam = await Team.deleteOne({ _id: teamId }).session(session);

    console.log("Deleted invites:", deleteInvites.deletedCount);
    console.log("Deleted tasks:", deleteTasks.deletedCount);
    console.log("Deleted team:", deleteTeam.deletedCount);

    // 4️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Team and related data deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("DELETE TEAM ERROR:", err);
    res.status(500).json({ error: "Failed to delete team" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.user._id; // logged-in user

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    // Only owner can remove manager or supervisor, owner/manager can remove employee
    const member = team.members.find((m) => String(m.userId) === memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const role = member.role;
    const requester = team.members.find(
      (m) => String(m.userId) === String(userId)
    );
    if (!requester) return res.status(403).json({ error: "Not allowed" });

    if (
      ((role === "manager" || role === "supervisor") &&
        requester.role !== "owner") ||
      (role === "employee" && !["owner", "manager"].includes(requester.role))
    ) {
      return res
        .status(403)
        .json({ error: "Not allowed to remove this member" });
    }

    // Remove member from team
    team.members = team.members.filter((m) => String(m.userId) !== memberId);
    await team.save();

    // Do NOT delete tasks
    res.json({
      success: true,
      message: "Member removed but task history retained",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
