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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

  // 1️⃣ Close today's tasks and create next day tasks
  await closeAndCreateNextDayTasks();

  // 2️⃣ Delete today's requested and rejected tasks
  await deleteRequestedAndRejectedTasks();
});

// Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
