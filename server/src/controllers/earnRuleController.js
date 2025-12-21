const EarnRule = require("../models/EarnRole");
const Team = require("../models/Team");

// GET /api/earnRules/:teamId
exports.getTeamRules = async (req, res) => {
  const { teamId } = req.params;
  try {
    const rules = await EarnRule.find({ team: teamId }).sort({ minAmount: 1 });
    res.json(rules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
};

// POST /api/earnRules
exports.addRule = async (req, res) => {
  const { teamId, minAmount, maxAmount, earn } = req.body;
  const userId = req.user._id;

  try {
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const owner = team.members.find((m) => m.role === "owner");
    if (!owner || String(owner.userId) !== String(userId)) {
      return res.status(403).json({ error: "Only owner can add rules" });
    }

    const newRule = await EarnRule.create({
      team: teamId,
      minAmount,
      maxAmount,
      earn,
      createdBy: userId,
    });

    res.status(201).json(newRule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add rule" });
  }
};

// PATCH /api/earnRules/:ruleId
exports.updateRule = async (req, res) => {
  const { ruleId } = req.params;
  const { minAmount, maxAmount, earn } = req.body;
  const userId = req.user._id;

  try {
    const rule = await EarnRule.findById(ruleId);
    if (!rule) return res.status(404).json({ error: "Rule not found" });

    const team = await Team.findById(rule.team);
    const owner = team.members.find((m) => m.role === "owner");
    if (!owner || String(owner.userId) !== String(userId)) {
      return res.status(403).json({ error: "Only owner can edit rules" });
    }

    rule.minAmount = minAmount;
    rule.maxAmount = maxAmount;
    rule.earn = earn;

    await rule.save();
    res.json(rule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update rule" });
  }
};

// DELETE /api/earnRules/:ruleId
exports.removeRule = async (req, res) => {
  const { ruleId } = req.params;
  const userId = req.user._id;

  try {
    const rule = await EarnRule.findById(ruleId);
    if (!rule) return res.status(404).json({ error: "Rule not found" });

    const team = await Team.findById(rule.team);
    const owner = team.members.find((m) => m.role === "owner");
    if (!owner || String(owner.userId) !== String(userId)) {
      return res.status(403).json({ error: "Only owner can delete rules" });
    }

    await rule.remove();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove rule" });
  }
};
