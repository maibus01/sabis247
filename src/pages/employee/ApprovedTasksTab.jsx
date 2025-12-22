import React from "react";
import { useTranslation } from "react-i18next";

export default function ApprovedTasksTab({ tasks = [], isManager = false, onRejectTask }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Filter tasks for today only
  const today = new Date();
  const todayTasks = tasks.filter((task) => {
    const taskDate = new Date(task.date || task.createdAt);
    return (
      taskDate.getFullYear() === today.getFullYear() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getDate() === today.getDate()
    );
  });

  // Totals
  const totalTasks = todayTasks.length;
  const totalAmount = todayTasks.reduce((sum, task) => sum + (task.amount || 0), 0);
  const totalEarn = todayTasks.reduce((sum, task) => sum + (task.earn || 0), 0);

  const tableDate =
    todayTasks.length > 0
      ? new Date(todayTasks[0].date || todayTasks[0].createdAt).toLocaleDateString(
          i18n.language,
          { weekday: "long", month: "short", day: "numeric", year: "numeric" }
        )
      : new Date().toLocaleDateString(i18n.language);

  return (
    <>
      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-sm border rounded-xl py-3 text-center">
          <p className="text-xs text-gray-400 uppercase">{t("totalTasks")}</p>
          <p className="text-xl font-bold text-gray-800">{totalTasks}</p>
        </div>

        <div className="bg-white shadow-sm border rounded-xl py-3 text-center">
          <p className="text-xs text-gray-400 uppercase">{t("totalAmount")}</p>
          <p className="text-xl font-bold text-hybriflow-dark-teal">{totalAmount} ر.س</p>
        </div>

        <div className="bg-white shadow-sm border rounded-xl py-3 text-center">
          <p className="text-xs text-gray-400 uppercase">{t("totalEarn")}</p>
          <p className="text-xl font-bold text-green-600">{totalEarn} ر.س</p>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white shadow rounded-xl overflow-auto max-h-[400px]">
        <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
          <thead>
            <tr className="bg-hybriflow-dark-teal text-white">
              <th className="px-4 py-3">{tableDate}</th>
              <th className="px-4 py-3">{t("tasks")}</th>
              <th className="px-4 py-3">{t("earn")}</th>
              <th className="px-4 py-3">{t("status") || "Status"}</th>
              {isManager && <th className="px-4 py-3">{t("action") || "Action"}</th>}
            </tr>
          </thead>

          <tbody>
            {todayTasks.length === 0 ? (
              <tr>
                <td
                  colSpan={isManager ? 5 : 4}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  {t("noTasksToday") || "No tasks for today"}
                </td>
              </tr>
            ) : (
              todayTasks.map((task) => {
                const time = task.createdAt ? new Date(task.createdAt) : null;
                const formattedTime =
                  time && !isNaN(time)
                    ? time.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" })
                    : "-";

                const canReject = isManager && task.status !== "closed";

                return (
                  <tr key={task._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{formattedTime}</td>
                    <td className="px-4 py-3">{task.amount} ر.س</td>
                    <td className="px-4 py-3">{task.earn} ر.س</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{task.status}</td>

                    {isManager && (
                      <td className="px-4 py-3 text-right">
                        {canReject && (
                          <button
                            onClick={() => onRejectTask(task._id)}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold"
                          >
                            {t("reject")}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
