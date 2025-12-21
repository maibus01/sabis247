const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const inviteController = require("../controllers/inviteController");
const { body, validationResult } = require("express-validator");

// Create invite
router.post(
  "/create",
  auth,
  body("teamId").notEmpty().withMessage("Team ID required"),
  body("role").isIn(["manager", "supervisor", "employee"]).withMessage("Invalid role"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  inviteController.createInvite
);

// Join team
router.post(
  "/join",
  auth,
  body("code").notEmpty().withMessage("Invite code required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  inviteController.joinTeam
);

module.exports = router;
