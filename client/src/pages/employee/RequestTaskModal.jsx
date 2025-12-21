import { useState } from "react";
import axios from "axios";

export default function RequestTaskModal({
  open,
  onClose,
  teamId,
  employeeId,
  token,
  onSuccess,
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!teamId || !employeeId || !token) {
      alert("Missing required data");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/tasks/request",
        {
          teamId,
          employeeId,
          amount: numericAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Task request sent successfully ✅");
      setAmount("");
      onClose();
      onSuccess && onSuccess();
    } catch (err) {
      console.error("Request task error:", err);
      alert(err.response?.data?.error || "Failed to request task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Request a Task
        </h2>

        <input
          type="number"
          min="1"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-hybriflow-dark-teal hover:bg-teal-700"
            }`}
          >
            {loading ? "Requesting..." : "Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
