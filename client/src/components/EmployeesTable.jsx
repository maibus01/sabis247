import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, ListChecks, DollarSign, Wallet } from "lucide-react";

export default function EmployeesTable({ teamId, days = 1 }) {
  const [employees, setEmployees] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !teamId) return;
      setLoading(true);

      try {
        // Employees
        const membersRes = await axios.get(
          `http://localhost:5000/api/teams/${teamId}/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const employeesOnly = membersRes.data
          .filter((m) => m.role === "employee")
          .map((m) => ({
            id: m._id || m.id,
            fullName: m.fullName,
          }));

        setEmployees(employeesOnly);

        // Tasks
        const historyRes = await axios.get(
          `http://localhost:5000/api/tasks/team/${teamId}/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const now = new Date();
        const fromDate = new Date();
        fromDate.setDate(now.getDate() - (days - 1));
        fromDate.setHours(0, 0, 0, 0);

        const filteredTasks = historyRes.data.filter((t) => {
          const taskDate = new Date(t.date || t.createdAt);
          return (
            t.status === "approved" &&
            taskDate >= fromDate &&
            taskDate <= now
          );
        });

        const totalsByEmployee = filteredTasks.reduce((acc, task) => {
          const empId = task.assignedTo?._id || task.assignedTo;
          if (!acc[empId]) {
            acc[empId] = {
              totalTasks: 0,
              totalAmount: 0,
              totalEarn: 0,
            };
          }

          acc[empId].totalTasks += 1;
          acc[empId].totalAmount += task.amount || 0;
          acc[empId].totalEarn += task.earn || 0;

          return acc;
        }, {});

        setTotals(totalsByEmployee);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setEmployees([]);
        setTotals({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, token, days]);

  if (!token) return <div className="pt-6 px-6">Unauthorized</div>;
  if (loading) return <div className="pt-6 px-6">Loading...</div>;

  return (
    <div className="overflow-x-auto w-full pt-4">
      <table className="min-w-full bg-white shadow-lg rounded-2xl overflow-hidden">
        <thead className="bg-teal-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-teal-800 flex items-center gap-2">
              <User size={16} /> Employee
            </th>
            <th className="px-4 py-3 text-right">
              <ListChecks size={16} />
            </th>
            <th className="px-4 py-3 text-right">
              <DollarSign size={16} />
            </th>
            <th className="px-4 py-3 text-right">
              <Wallet size={16} />
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => {
            const t = totals[emp.id] || {
              totalTasks: 0,
              totalAmount: 0,
              totalEarn: 0,
            };

            return (
              <tr
                key={emp.id}
                className="border-b hover:bg-teal-50"
              >
                <td className="px-4 py-3 font-medium">
                  {emp.fullName}
                </td>
                <td className="px-4 py-3 text-right">
                  {t.totalTasks}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-green-600">
                  ${t.totalAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-teal-700">
                  ${t.totalEarn.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
