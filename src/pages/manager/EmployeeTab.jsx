import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddTaskModal from "./AddTaskModal";
import { useTranslation } from "react-i18next";

export default function EmployeesTab({ teamId }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [employees, setEmployees] = useState([]);
  const [totals, setTotals] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;

  const fetchEmployeesAndTotals = async () => {
    if (!token || !teamId) return;

    setLoading(true);
    try {
      const membersRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/teams/${teamId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const employeesOnly = membersRes.data.filter(
        (m) => m.role === "employee"
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTotals = await Promise.all(
        employeesOnly.map(async (emp) => {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/tasks/team/${teamId}/history?userId=${emp.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const todayTasks = (res.data || []).filter((t) => {
            const taskDate = new Date(t.date || t.createdAt);
            return (
              taskDate.getFullYear() === today.getFullYear() &&
              taskDate.getMonth() === today.getMonth() &&
              taskDate.getDate() === today.getDate()
            );
          });

          return {
            employeeId: emp.id,
            totalTasks: todayTasks.length,
            totalAmount: todayTasks.reduce(
              (sum, t) => sum + (t.amount || 0),
              0
            ),
            totalEarn: todayTasks.reduce(
              (sum, t) => sum + (t.earn || 0),
              0
            ),
          };
        })
      );

      setEmployees(employeesOnly);
      setTotals(todayTotals);
    } catch (err) {
      console.error("Failed to fetch employees/tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesAndTotals();
  }, [teamId]);

  if (loading)
    return (
      <div className="text-center text-gray-500 py-6">
        {t("loading")}
      </div>
    );

  const totalsMap = totals.reduce((acc, t) => {
    acc[t.employeeId] = t;
    return acc;
  }, {});

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                {t("employee")}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                {t("tasksToday")}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                {t("amountToday")}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                {t("earnToday")}
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                {t("action")}
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map((e) => {
              const tData = totalsMap[e.id] || {};
              return (
                <tr
                  key={e.id}
                  onClick={() =>
                    navigate(`/team/${teamId}/employee/${e.id}`)
                  }
                  className="border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {e.fullName}
                  </td>

                  <td className="px-4 py-3 text-right text-gray-600">
                    {tData.totalTasks || 0}
                  </td>

                  <td className="px-4 py-3 text-right text-gray-600">
                    {tData.totalAmount || 0} ر.س
                  </td>

                  <td className="px-4 py-3 text-right text-gray-600">
                    {tData.totalEarn || 0} ر.س
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSelectedEmployee(e);
                      }}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-hybriflow-dark-teal hover:bg-teal-700 transition"
                    >
                      {t("add")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedEmployee && (
        <AddTaskModal
          teamId={teamId}
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSuccess={() => {
            fetchEmployeesAndTotals();
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}
