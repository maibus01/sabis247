import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function EarnRulesEditor({ teamId, team, rules, refreshRules }) {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const token = user?.token;
  const userId = String(user?._id);

  // Check if logged-in user is the owner of the team
  const member = team?.members?.find((m) => String(m.userId?._id) === userId);
  const isOwner = member?.role?.toLowerCase() === "owner";

  const [editingRuleId, setEditingRuleId] = useState(null);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [earn, setEarn] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddOrUpdate = async () => {
    if (!minAmount || !maxAmount || !earn) return alert(t("allFieldsRequired"));
    setLoading(true);

    try {
      if (editingRuleId) {
        await axios.patch(
          `http://localhost:5000/api/earnRules/${editingRuleId}`,
          { minAmount, maxAmount, earn },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/earnRules",
          { teamId, minAmount, maxAmount, earn },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await refreshRules();
      setEditingRuleId(null);
      setMinAmount("");
      setMaxAmount("");
      setEarn("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || t("failedSaveRule"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingRuleId(rule._id);
    setMinAmount(rule.minAmount);
    setMaxAmount(rule.maxAmount);
    setEarn(rule.earn);
  };

  const handleDelete = async (ruleId) => {
    if (!confirm(t("confirmDeleteRule"))) return;
    setLoading(true);

    try {
      await axios.delete(`http://localhost:5000/api/earnRules/${ruleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshRules();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || t("failedDeleteRule"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-xl shadow-sm border">
      {/* Add/Edit form - only owner */}
      {isOwner && (
        <div className="p-4 bg-white rounded-lg border space-y-2">
          <h2 className="font-bold text-lg text-gray-800">
            {editingRuleId ? t("editRule") : t("addNewRule")}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <input
              type="number"
              placeholder={t("minAmount")}
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="border px-2 py-1 rounded w-24"
            />
            <input
              type="number"
              placeholder={t("maxAmount")}
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="border px-2 py-1 rounded w-24"
            />
            <input
              type="number"
              placeholder={t("earn")}
              value={earn}
              onChange={(e) => setEarn(e.target.value)}
              className="border px-2 py-1 rounded w-24"
            />
            <button
              onClick={handleAddOrUpdate}
              disabled={loading}
              className={`px-4 py-1 rounded text-white ${
                loading ? "bg-gray-400" : "bg-hybriflow-dark-teal hover:bg-teal-700"
              }`}
            >
              {editingRuleId ? t("update") : t("add")}
            </button>
            {editingRuleId && (
              <button
                onClick={() => {
                  setEditingRuleId(null);
                  setMinAmount("");
                  setMaxAmount("");
                  setEarn("");
                }}
                className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400"
              >
                {t("cancel")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-2">
        {rules.length === 0 && <p className="text-gray-500">{t("noRulesFound")}</p>}
        {rules.map((rule) => (
          <div
            key={rule._id}
            className="flex justify-between items-center p-2 border rounded bg-white"
          >
            <div className="text-gray-800">
              {rule.minAmount} - {rule.maxAmount} → {t("earn")}: {rule.earn}
            </div>

            {/* Owner-only buttons */}
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(rule)}
                  className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 rounded"
                >
                  {t("edit")}
                </button>
                <button
                  onClick={() => handleDelete(rule._id)}
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  {t("delete")}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
