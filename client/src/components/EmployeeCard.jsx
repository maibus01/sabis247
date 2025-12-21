// src/components/manager/EmployeeCard.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function EmployeeCard({ employeeId, teamId, onClose }) {
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;

  /* ---------------- FETCH DATA ---------------- */

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1️⃣ Fetch tasks for employee
      const tasksRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tasks/user/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2️⃣ Fetch team members (WORKING endpoint)
      const membersRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/teams/${teamId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const emp = membersRes.data.find(
        (m) => String(m.id) === String(employeeId)
      );

      if (!emp) {
        setError("Employee not found");
        setLoading(false);
        return;
      }

      setEmployee(emp);
      setTasks(tasksRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error("EmployeeCard fetch failed:", err);
      setError("Failed to load employee data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!employeeId || !teamId) return;
    fetchEmployeeData();
  }, [employeeId, teamId]);

  /* ---------------- ACTIONS ---------------- */

  const handleEdit = async (taskId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`,
        { amount: Number(editValue) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditIndex(null);
      setEditValue("");
      fetchEmployeeData();
    } catch {
      alert("Failed to edit task");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEmployeeData();
    } catch {
      alert("Failed to delete task");
    }
  };

  /* ---------------- STATES ---------------- */

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-xl text-red-600">
          {error}
        </div>
      </div>
    );
  }

  /* ---------------- DATA ---------------- */

  const activeTasks = tasks.filter((t) => t.status !== "deleted");

  const totals = {
    washes: activeTasks.length,
    money: activeTasks.reduce((s, t) => s + t.amount, 0),
    earn: activeTasks.reduce((s, t) => s + (t.earn || 0), 0),
    gift: activeTasks.reduce((s, t) => s + (t.gift || 0), 0),
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-start pt-16 px-2">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-4 relative">
        <button
          className="absolute top-2 right-2 text-xl text-gray-500"
          onClick={onClose}
        >
          ×
        </button>

        <h3 className="font-bold text-lg mb-3">
          {employee.fullName}'s Tasks
        </h3>

        {/* TASK LIST */}
        <div className="bg-gray-50 rounded p-3 max-h-72 overflow-auto mb-4">
          {activeTasks.length === 0 && (
            <p className="text-center text-gray-400">No tasks</p>
          )}

          {activeTasks.map((t, i) => (
            <div
              key={t._id}
              className="bg-gray-100 rounded p-2 mb-2 flex justify-between"
            >
              {editIndex === i ? (
                <div className="flex gap-2 w-full">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="border rounded px-2 w-24"
                  />
                  <button
                    className="bg-green-500 text-white px-2 rounded"
                    onClick={() => handleEdit(t._id)}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <div className="font-semibold">
                      ${t.amount}
                      {t.gift ? (
                        <span className="text-xs text-gray-500">
                          {" "}gift ${t.gift}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-500">
                      earn ${t.earn || 0} •{" "}
                      {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 bg-yellow-400 text-white rounded"
                      onClick={() => {
                        setEditIndex(i);
                        setEditValue(t.amount);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDelete(t._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* TOTALS */}
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Total Washes" value={totals.washes} />
          <Stat label="Total Money" value={`$${totals.money}`} />
          <Stat label="Total Earn" value={`$${totals.earn}`} />
          <Stat label="Total Gifts" value={`$${totals.gift}`} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */

function Stat({ label, value }) {
  return (
    <div className="bg-gray-100 rounded p-2 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
  