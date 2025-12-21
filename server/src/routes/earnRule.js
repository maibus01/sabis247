const express = require("express");
const router = express.Router();
const earnRuleController = require("../controllers/earnRuleController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require auth
router.use(authMiddleware);

// Get all rules for a team
router.get("/team/:teamId", earnRuleController.getTeamRules);

// Add new rule
router.post("/", earnRuleController.addRule);
router.patch("/:ruleId", earnRuleController.updateRule);

// Delete a rule
router.delete("/:ruleId", earnRuleController.removeRule);

module.exports = router;
