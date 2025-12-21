const express = require('express');
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const verifyTeamMembership = require("../middleware/verifyTeamMembership");
const teamController = require('../controllers/teamController');

router.post('/', auth, teamController.createTeam);
router.get('/user/:me', auth, teamController.getUserTeams);
router.get("/:teamId", auth, verifyTeamMembership, teamController.getTeamById);
router.get("/:teamId/members", auth, verifyTeamMembership, teamController.getTeamMembers);
router.get("/:teamId/employee-totals", auth, verifyTeamMembership, teamController.getEmployeeTotals);
router.delete("/:teamId", auth, teamController.deleteTeam);
router.delete("/:teamId/members/:memberId", auth, teamController.removeMember);


module.exports = router;
