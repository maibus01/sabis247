import { useState } from "react";
import axios from "axios";

export default function AddTaskModal({ teamId, employee, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;

  const createTask = async () => {
    if (!amount) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tasks`,
        {
          teamId,
          assignedTo: employee.id,
          amount: Number(amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-80 shadow-lg">
        <h2 className="font-bold text-lg mb-4 text-hybriflow-dark-teal">
          Add Task for {employee.fullName}
        </h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full border border-gray-300 px-3 py-2 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-500 transition"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={createTask}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
