const EarnRule = require("../models/EarnRole");

async function calculateEarn(teamId, amount) {
  const rules = await EarnRule.find({ team: teamId }).sort({ minAmount: 1 });

  const rule = rules.find((r) => amount >= r.minAmount && amount <= r.maxAmount);
  return rule ? rule.earn : 0;
}

module.exports = calculateEarn;
