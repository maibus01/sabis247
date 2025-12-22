import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function EmployeeHistory({ teamId, employeeId }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;

  const fetchHistory = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tasks/team/${teamId}/history?userId=${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Only approved tasks
      const approvedTasks = res.data.filter((t) => t.status === "approved");
      setTasks(approvedTasks);
    } catch (err) {
      console.error("Failed to fetch employee history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [teamId, employeeId]);

  if (loading)
    return <div className="text-center py-6 text-gray-400">{t("loadingHistory")}</div>;

  if (!tasks.length)
    return <div className="text-center py-6 text-gray-400">{t("noHistory")}</div>;

  // Group tasks by date (newest first)
  const tasksByDate = tasks.reduce((acc, task) => {
    const dateStr = new Date(task.date || task.createdAt).toLocaleDateString(i18n.language);
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className={`space-y-6 max-h-[600px] overflow-y-auto ${isRTL ? "text-right" : "text-left"}`}>
      {sortedDates.map((date) => {
        const tasksForDay = tasksByDate[date];
        const totalTasks = tasksForDay.length;
        const totalAmount = tasksForDay.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalEarn = tasksForDay.reduce((sum, t) => sum + (t.earn || 0), 0);

        return (
          <div key={date} className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <p className="font-semibold text-gray-700 mb-2">{date}</p>

            {/* Daily totals */}
            <div className="grid grid-cols-3 gap-4 mb-3 text-center">
              <div className="bg-white border rounded-xl py-2">{t("totalTasks")}: {totalTasks}</div>
              <div className="bg-white border rounded-xl py-2">{t("totalAmount")}: {totalAmount} ر.س</div>
              <div className="bg-white border rounded-xl py-2">{t("totalEarn")}: {totalEarn} ر.س</div>
            </div>

            {/* Individual tasks */}
            <div className="flex flex-wrap gap-2 items-center">
              {tasksForDay.map((t, idx) => (
                <span
                  key={idx}
                  className="bg-white border rounded-full px-3 py-1 text-sm shadow-sm"
                >
                  {t.amount} ر.س
                </span>
              ))}
              <span className="font-bold text-teal-800 ml-2">
                {t("totalEarn")}: {totalEarn} ر.س
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
