require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const cron = require("node-cron");

const {
  closeAndCreateNextDayTasks,
  deleteRequestedAndRejectedTasks
} = require("./src/controllers/tasksController");

const userRoutes = require("./src/routes/users");
const teamRoutes = require("./src/routes/teams");
const inviteRoutes = require("./src/routes/invite");
const tasksRoutes = require("./src/routes/tasks");
const earnRulesRouter = require("./src/routes/earnRule");
const adminRoutes = require("./src/routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

/* 🔹 MOBILE-SAFE CORS */
app.use(cors({
  origin: [
    "http://localhost:5173",           // Vite dev
    "https://sabis247.vercel.app"     // Production frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400 // cache preflight requests (important for mobile Safari)
}));

/* 🔹 Body parser */
app.use(bodyParser.json());

/* 🔹 API Routes */
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/earnRules", earnRulesRouter);
app.use("/api/admin", adminRoutes);

/* 🔹 Health check */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* 🔹 Cron jobs */
cron.schedule("59 23 * * *", async () => {
  console.log("⏰ Running daily task rollover...");
  await closeAndCreateNextDayTasks();
  await deleteRequestedAndRejectedTasks();
});

/* 🔹 MongoDB connection */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

/* 🔹 Serve React build for all other routes */
const clientBuildPath = path.join(__dirname, "client/dist"); // <-- adjust if your build folder is elsewhere
app.use(express.static(clientBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

/* 🔹 Start server */
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
