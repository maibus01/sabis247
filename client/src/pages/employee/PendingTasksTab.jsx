import React from "react";
import { useTranslation } from "react-i18next";

export default function PendingTasksTab({ tasks }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const today = new Date();
  const todayString = today.toLocaleDateString(i18n.language);

  // Filter only today's tasks
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todaysTasks = tasks.filter((t) => {
    const created = new Date(t.createdAt);
    return created >= startOfToday && created <= endOfToday;
  });

  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        {todayString} - {t("pendingTasks")}
      </h2>

      {todaysTasks.length === 0 ? (
        <p className="mb-4 text-gray-500 italic">{t("noPendingTasks")}</p>
      ) : (
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-auto max-h-[300px] mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="px-4 py-3 text-left font-semibold">{t("time")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("amount")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {todaysTasks.map((t) => (
                <tr
                  key={t._id}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(t.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-4 py-3 font-medium">{t.amount} ر.س</td>

                  <td className="px-4 py-3 capitalize">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        t.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
