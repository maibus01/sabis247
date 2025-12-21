require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cron = require("node-cron");

const { closeAndCreateNextDayTasks, deleteRequestedAndRejectedTasks } = require("./src/controllers/tasksController");

const userRoutes = require("./src/routes/users");
const teamRoutes = require("./src/routes/teams");
const inviteRoutes = require("./src/routes/invite");
const tasksRoutes = require("./src/routes/tasks");
const earnRulesRouter = require("./src/routes/earnRule");
const adminRoutes = require("./src/routes/admin");

// ⚡ THIS WAS MISSING
const app = express();

const PORT = process.env.PORT || 5000;

// CORS - allow only your frontend
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sabis247.vercel.app"
  ],
  credentials: true
}));


app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/earnRules", earnRulesRouter);
app.use("/api/admin", adminRoutes);

// ⏰ DAILY CRON (23:59)
cron.schedule("59 23 * * *", async () => {
  console.log("⏰ Running daily task rollover...");
  await closeAndCreateNextDayTasks();
  await deleteRequestedAndRejectedTasks();
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Test route to confirm backend is alive
app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
