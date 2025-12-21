// const express = require("express");
// const router = express.Router();

// const auth = require("../middleware/authMiddleware");
// const adminOnly = require("../middleware/adminMiddleware");
// const adminController = require("../controllers/adminController");

// router.get("/users", auth, adminOnly, adminController.getAllUsers);
// router.get("/teams", auth, adminOnly, adminController.getAllTeams);
// router.get("/stats", auth, adminOnly, adminController.getSystemStats);

// module.exports = router;


const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

// ✅ Admin-only routes
router.get("/users", auth, adminOnly, adminController.getAllUsers);
router.get("/teams", auth, adminOnly, adminController.getAllTeams);
router.get("/teams/:teamId", auth, adminOnly, adminController.getTeamById);

router.get("/stats", auth, adminOnly, adminController.getSystemStats);

// ✅ Toggle user active/disabled status
router.put("/users/:id/toggle", auth, adminOnly, adminController.toggleUser);

module.exports = router;
