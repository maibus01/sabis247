require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

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

/* 🔥 CORS setup */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sabis247.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400
}));

app.use(bodyParser.json());

/* 🔹 API Routes */
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/earnRules", earnRulesRouter);
app.use("/api/admin", adminRoutes);

/* Health check */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* 🔹 Serve frontend (Vite React build) */
const DIST_DIR = path.join(__dirname, "dist");

// 1️⃣ Serve static files FIRST
app.use(express.static(DIST_DIR));

// 2️⃣ SPA fallback — ONLY for non-file requests
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.sendStatus(404);
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

/* 🔹 MongoDB Connection */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

/* 🔹 Start server */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
