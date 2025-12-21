const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const taskController = require("../controllers/tasksController");

// -----------------------------
// Task creation
// -----------------------------

// Manager creates a task for an employee
router.post("/", auth, taskController.createTask);

// Employee requests a task (self-added)
router.post("/request", auth, taskController.createTaskRequest);

// -----------------------------
// Task approval/rejection
// -----------------------------

// Manager approves a requested task
router.patch("/:taskId/approve", auth, taskController.approveTask);

// Manager rejects a requested task
router.patch("/:taskId/reject", auth, taskController.rejectTask);

// -----------------------------
// Task fetching
// -----------------------------

// Get all pending requests for a team (manager inbox)
router.get("/requests/:teamId", auth, taskController.getPendingRequests);

// Get all tasks assigned to a specific user
router.get("/team/:teamId/user/:userId", auth, taskController.getTasksByUser);

// Get total stats for a team (approved tasks)
router.get("/team/:teamId/totals", auth, taskController.getTeamTotals);

// Close daily tasks (manager / owner)
router.post("/team/:teamId/close-day", auth, taskController.closeDayForTeam);

// History (admin / manager)
router.get("/team/:teamId/history", auth, taskController.getTaskHistory);

router.get("/team/:teamId/salary", auth, taskController.getSalarySummary);

module.exports = router;
