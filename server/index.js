require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

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

/* 🔹 Serve React app */
const DIST_DIR = path.join(__dirname, "dist");

// Serve static files (JS, CSS, images) with correct MIME type
app.use(express.static(DIST_DIR));

// Only serve index.html for non-API routes that don’t match a static file
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next(); // skip API routes
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
