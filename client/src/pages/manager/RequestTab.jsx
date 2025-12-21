import axios from "axios";
import { useTranslation } from "react-i18next";

export default function RequestsTab({ requests, refreshRequests }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;

  const handleAction = async (taskId, action) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshRequests();
    } catch (err) {
      console.error("Error performing action:", err);
      alert(t("actionFailed") || "Action failed");
    }
  };

  if (!requests || requests.length === 0)
    return (
      <p className="text-center text-gray-500 py-6">
        {t("noPendingRequests")}
      </p>
    );

  return (
    <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
      {requests.map((task) => {
        const creator =
          task.createdBy?.fullName ||
          task.createdBy?.name ||
          t("unknown");

        return (
          <div
            key={task._id}
            className="relative bg-white shadow rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
          >
            {/* Amount */}
            <div
              className={`absolute top-2 ${
                isRTL ? "left-4" : "right-4"
              } sm:static text-lg sm:text-base font-bold text-hybriflow-dark-teal`}
            >
              {task.amount} ر.س
            </div>

            {/* Task Info */}
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm sm:text-base truncate">
                {creator}
              </p>

              <p className="text-sm text-gray-600">
                {t("status")}: {task.status}
              </p>
            </div>

            {/* Actions */}
            {task.status === "requested" && (
              <div className="flex gap-2 flex-wrap sm:flex-nowrap mt-2 sm:mt-0">
                <button
                  onClick={() => handleAction(task._id, "approve")}
                  className="bg-green-600 text-white px-4 py-1.5 rounded font-semibold hover:bg-green-700 transition"
                >
                  {t("approve")}
                </button>

                <button
                  onClick={() => handleAction(task._id, "reject")}
                  className="bg-red-600 text-white px-4 py-1.5 rounded font-semibold hover:bg-red-700 transition"
                >
                  {t("reject")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
