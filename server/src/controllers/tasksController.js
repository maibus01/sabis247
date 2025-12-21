const mongoose = require("mongoose");
const Task = require("../models/Task");
const Team = require("../models/Team");
const calculateEarn = require("../utils/calculateEarn");

const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/* ------------------------------------------------------
   MANAGER CREATES A TASK FOR EMPLOYEE
------------------------------------------------------ */
exports.createTask = async (req, res) => {
  const { teamId, assignedTo, amount, gift, title } = req.body;
  const createdBy = req.user._id;

  const team = await Team.findById(teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const creator = team.members.find(m => String(m.userId) === String(createdBy));
  if (!creator || !["manager", "owner"].includes(creator.role)) {
    return res.status(403).json({ error: "Not allowed" });
  }

  // Employee must be in team
  const emp = team.members.find(m => String(m.userId) === String(assignedTo));
  if (!emp) return res.status(400).json({ error: "Employee not in team" });

  // Calculate earn using rules
  const earn = await calculateEarn(teamId, amount);

  const task = await Task.create({
    team: teamId,
    assignedTo,
    createdBy,
    amount,
    earn,
    gift: gift || 0,
    title: title || "Task",
    status: "approved", // auto approved
  });

  res.status(201).json(task);
};

/* ------------------------------------------------------
   REJECT TASK (MANAGER ONLY, BEFORE DAY END)
------------------------------------------------------ */
exports.rejectTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Find task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // 2️⃣ Block after day close
    if (task.status === "closed") {
      return res.status(403).json({
        error: "Day already closed. Task cannot be rejected",
      });
    }

    // 3️⃣ Load team
    const team = await Team.findById(task.team);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // 4️⃣ Manager / owner only
    const member = team.members.find(
      m => String(m.userId) === String(userId)
    );

    if (!member || !["manager", "owner"].includes(member.role)) {
      return res.status(403).json({
        error: "Only managers can reject tasks",
      });
    }

    // 5️⃣ Already rejected
    if (task.status === "rejected") {
      return res.status(400).json({
        error: "Task already rejected",
      });
    }

    // 6️⃣ Reject (allowed even if approved)
    task.status = "rejected";
    task.rejectedAt = new Date();
    task.rejectedBy = userId;

    await task.save();

    res.json({
      success: true,
      message: "Task rejected successfully",
      task,
    });
  } catch (err) {
    console.error("Reject task error:", err);
    res.status(500).json({ error: err.message });
  }
};


/* ------------------------------------------------------
   EMPLOYEE SUBMITS A REQUESTED TASK
------------------------------------------------------ */

exports.createTaskRequest = async (req, res) => {
  try {
    const { teamId, employeeId, amount } = req.body;

    // 1️⃣ Validate input
    if (!teamId || !employeeId || !amount) {
      return res.status(400).json({
        error: "teamId, employeeId, and amount are required",
      });
    }

    // 2️⃣ Ensure requesting for self
    if (String(req.user._id) !== String(employeeId)) {
      return res.status(403).json({
        error: "You can only request tasks for yourself",
      });
    }

    // 3️⃣ Load team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // 4️⃣ Find membership
    const member = team.members.find(
      (m) => String(m.userId) === String(req.user._id)
    );

    if (!member) {
      return res.status(403).json({
        error: "You are not a member of this team",
      });
    }

    // 5️⃣ ROLE CHECK (✅ THIS IS THE FIX)
    if (member.role !== "employee") {
      return res.status(403).json({
        error: "Only employees can request tasks",
      });
    }

    // 6️⃣ Create task
    const newTask = await Task.create({
      team: teamId,
      assignedTo: employeeId,
      createdBy: req.user._id,
      amount,
      status: "requested",
    });

    // 7️⃣ Populate response
    const populatedTask = await Task.findById(newTask._id)
      .populate("createdBy", "fullName name")
      .populate("assignedTo", "fullName name");

    res.status(201).json(populatedTask);
  } catch (err) {
    console.error("Create task request error:", err);
    res.status(500).json({ error: err.message });
  }
};



const deleteRequestedAndRejectedTasks = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const result = await Task.deleteMany({
      status: { $in: ["requested", "rejected"] },
      createdAt: { $gte: today, $lt: tomorrow } // only today's tasks
    });

    console.log(`Deleted ${result.deletedCount} requested/rejected tasks from today`);
  } catch (err) {
    console.error("Error deleting tasks:", err);
  }
};

/* ------------------------------------------------------
   GET PENDING TASK REQUESTS (MANAGER INBOX)
------------------------------------------------------ */
exports.getPendingRequests = async (req, res) => {
  try {
    const { teamId } = req.params;

    const requests = await Task.find({ team: teamId, status: "requested" })
      .populate("createdBy", "fullName name")   // include fullName
      .populate("assignedTo", "fullName name") // include fullName
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------------------------------------
   APPROVE TASK (MANAGER)
------------------------------------------------------ */
exports.approveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const team = await Team.findById(task.team);
    const isManagerOrOwner = [team.getOwner()?.toString(), team.getManager()?.toString()].includes(userId.toString());
    if (!isManagerOrOwner) return res.status(403).json({ error: "Not allowed" });

    task.status = "approved";
    task.earn = await calculateEarn(task.team, task.amount);
    task.gift = task.gift || 0;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------------------------------------
   REJECT TASK (MANAGER)
------------------------------------------------------ */
exports.rejectTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.status = "rejected";
    await task.save();

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------------------------------------
   GET TASKS BY USER
------------------------------------------------------ */
exports.getTasksByUser = async (req, res) => {
  try {
    const { userId, teamId } = req.params;

    const tasks = await Task.find({
      assignedTo: userId,
      team: teamId,
    })
      .populate("createdBy", "name email") // populate createdBy with name and email
      .populate("assignedTo", "name email") 
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------------------------------------
   GET TEAM TOTALS
------------------------------------------------------ */
exports.getTeamTotals = async (req, res) => {
  const { teamId } = req.params;
  try {
    const tasks = await Task.find({ team: teamId, status: "approved" });
    const totals = {
      totalAmount: tasks.reduce((sum, t) => sum + (t.amount || 0), 0),
      totalEarn: tasks.reduce((sum, t) => sum + (t.earn || 0), 0),
      totalGift: tasks.reduce((sum, t) => sum + (t.gift || 0), 0),
      totalTasks: tasks.length,
    };
    res.json(totals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch totals" });
  }
};

/* ------------------------------------------------------
   CLOSE DAY FOR TEAM (MANAGER)
------------------------------------------------------ */

exports.closeDayForTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Validate team
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const member = team.members.find(
      m => String(m.userId) === String(userId)
    );

    if (!member || !["manager", "owner"].includes(member.role)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const today = getTodayDate();

    // 2️⃣ Close all open tasks for today
    const result = await Task.updateMany(
      { team: teamId, date: today, status: "open" },
      { status: "closed", closedAt: new Date() }
    );

    // 3️⃣ Create new tasks for tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const employees = team.members.filter(m => m.role === "employee");

    for (const emp of employees) {
      const exists = await Task.findOne({
        team: teamId,
        assignedTo: emp.userId,
        date: tomorrow
      });

      if (!exists) {
        await Task.create({
          team: teamId,
          assignedTo: emp.userId,
          createdBy: team.owner || emp.userId,
          date: tomorrow,
          amount: 0,
          earn: 0,
          status: "open",
          title: "Daily Task"
        });
      }
    }

    res.json({
      message: "Day closed and next day tasks created",
      closedTasks: result.modifiedCount
    });
  } catch (err) {
    console.error("Close day error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ------------------------------------------------------
   TASK HISTORY
------------------------------------------------------ */
// controllers/tasksController.js

exports.getTaskHistory = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.query;

    // Filter for approved tasks (not waiting for "closed")
    const filter = {
      team: teamId,
      status: "approved", // <-- include all approved tasks
    };

    if (userId) filter.assignedTo = userId;

    const tasks = await Task.find(filter)
      .populate("assignedTo", "fullName name")
      .populate("createdBy", "fullName name")
      .sort({ date: -1, createdAt: -1 }); // sort by date descending

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching task history:", err);
    res.status(500).json({ error: err.message });
  }
};


/* ------------------------------------------------------
   SALARY SUMMARY
------------------------------------------------------ */
exports.getSalarySummary = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { type, userId } = req.query;

    let startDate = new Date();
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (type) {
      case "weekly":
        startDate.setDate(startDate.getDate() - 6);
        break;
      case "ten":
        startDate.setDate(startDate.getDate() - 9);
        break;
      case "monthly":
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        break;
      default: // daily
        startDate.setHours(0, 0, 0, 0);
    }

    const match = {
      team: teamId,
      status: "closed",
      date: { $gte: startDate, $lte: endDate },
    };

    if (userId) match.assignedTo = new mongoose.Types.ObjectId(userId);

    const summary = await Task.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$assignedTo",
          totalEarn: { $sum: "$earn" },
          totalTasks: { $sum: 1 },
        },
      },
    ]);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
