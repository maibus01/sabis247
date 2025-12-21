const mongoose = require("mongoose");

const earnRuleSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    earn: { type: Number, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EarnRule", earnRuleSchema);
