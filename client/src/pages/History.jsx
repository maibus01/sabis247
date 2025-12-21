import { useEffect, useState, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useTranslation } from "react-i18next";

export default function ManagerHistory({ teamId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;

  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    const storedTeam = JSON.parse(localStorage.getItem("currentTeam"));
    if (storedTeam?.name) {
      setTeamName(storedTeam.name);
    }
  }, []);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/tasks/team/${teamId}/history?type=daily`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const approvedTasks = res.data.filter(
        (t) => t.assignedTo && t.status === "approved"
      );

      setHistory(approvedTasks);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [teamId]);

  // const exportDatePDF = (date, tasksForDay) => {
  //   const element = document.createElement("div");
  //   element.style.direction = isRTL ? "rtl" : "ltr";
  //   element.style.fontFamily = "Arial, sans-serif";
  //   element.style.width = "100%";
  //   element.style.padding = "20px";

  //   // Header
  //   const header = document.createElement("h2");
  //   header.innerText = `${t("date")}: ${date}`;
  //   header.style.textAlign = "center";
  //   element.appendChild(header);

  //   // Table
  //   const table = document.createElement("table");
  //   table.style.width = "100%";
  //   table.style.borderCollapse = "collapse";
  //   table.style.textAlign = isRTL ? "right" : "left";

  //   // Table Header
  //   const thead = document.createElement("thead");
  //   const headerRow = document.createElement("tr");
  //   [t("employee"), t("tasks"), t("totalEarn")].forEach((text) => {
  //     const th = document.createElement("th");
  //     th.innerText = text;
  //     th.style.border = "1px solid #444";
  //     th.style.padding = "6px 10px";
  //     th.style.backgroundColor = "#f0f0f0";
  //     headerRow.appendChild(th);
  //   });
  //   thead.appendChild(headerRow);
  //   table.appendChild(thead);

  //   // Group tasks by employee
  //   const tasksByEmployee = tasksForDay.reduce((acc, t) => {
  //     const empId = t.assignedTo?._id || t.assignedTo;
  //     const empName =
  //       t.assignedTo?.fullName || t.assignedTo?.name || t("unknown");
  //     if (!acc[empId]) acc[empId] = { name: empName, tasks: [], totalEarn: 0 };
  //     acc[empId].tasks.push(t.amount || 0);
  //     acc[empId].totalEarn += t.earn || 0;
  //     return acc;
  //   }, {});

  //   const tbody = document.createElement("tbody");

  //   Object.values(tasksByEmployee).forEach((emp, idx) => {
  //     const row = document.createElement("tr");

  //     // Employee
  //     const tdName = document.createElement("td");
  //     tdName.innerText = `${idx + 1}. ${emp.name}`;
  //     tdName.style.border = "1px solid #444";
  //     tdName.style.padding = "6px 10px";
  //     row.appendChild(tdName);

  //     // Tasks (❌ NO SAR HERE)
  //     const tdTasks = document.createElement("td");
  //     tdTasks.style.border = "1px solid #444";
  //     tdTasks.style.padding = "6px 10px";
  //     tdTasks.innerText = emp.tasks.join(" | ");
  //     row.appendChild(tdTasks);

  //     // Total Earn (✅ SAR stays)
  //     const tdTotal = document.createElement("td");
  //     tdTotal.style.border = "1px solid #444";
  //     tdTotal.style.padding = "6px 10px";
  //     tdTotal.innerText = `${emp.totalEarn} ر.س`;
  //     row.appendChild(tdTotal);

  //     tbody.appendChild(row);
  //   });

  //   table.appendChild(tbody);
  //   element.appendChild(table);

  //   // Bottom totals
  //   const totalTasks = tasksForDay.length;
  //   const totalAmount = tasksForDay.reduce(
  //     (sum, t) => sum + (t.amount || 0),
  //     0
  //   );
  //   const totalEarn = tasksForDay.reduce((sum, t) => sum + (t.earn || 0), 0);

  //   const totalsDiv = document.createElement("div");
  //   totalsDiv.style.marginTop = "15px";
  //   totalsDiv.style.fontWeight = "bold";
  //   totalsDiv.innerText =
  //     `${t("totalTasks")}: ${totalTasks} | ` +
  //     `${t("totalAmount")}: ${totalAmount} | ` +
  //     `${t("totalEarn")}: ${totalEarn} ر.س`;

  //   element.appendChild(totalsDiv);

  //   html2pdf()
  //     .from(element)
  //     .set({
  //       margin: 10,
  //       filename: `tasks_${date}.pdf`,
  //       html2canvas: { scale: 2 },
  //       jsPDF: { orientation: "landscape", unit: "pt", format: "a4" },
  //     })
  //     .save();
  // };

  const exportDatePDF = (date, tasksForDay) => {
  const element = document.createElement("div");
  element.style.direction = isRTL ? "rtl" : "ltr";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.width = "100%";
  element.style.padding = "20px";

  // =====================
  // TEAM NAME
  // =====================
  const teamHeader = document.createElement("h1");
  teamHeader.innerText = teamName || " ";
  teamHeader.style.textAlign = "center";
  teamHeader.style.marginBottom = "6px";
  teamHeader.style.fontWeight = "bold";
  element.appendChild(teamHeader);

  // =====================
  // DATE
  // =====================
  const dateHeader = document.createElement("h3");
  dateHeader.innerText = `${t("date")}: ${date}`;
  dateHeader.style.textAlign = "center";
  dateHeader.style.marginBottom = "18px";
  element.appendChild(dateHeader);

  // =====================
  // TABLE
  // =====================
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.textAlign = isRTL ? "right" : "left";

  // Table Head
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  [t("employee"), t("tasks"), t("totalEarn")].forEach((text) => {
    const th = document.createElement("th");
    th.innerText = text;
    th.style.border = "1px solid #444";
    th.style.padding = "8px 10px";
    th.style.backgroundColor = "#f0f0f0";
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // =====================
  // GROUP TASKS BY EMPLOYEE
  // =====================
  const tasksByEmployee = tasksForDay.reduce((acc, t) => {
    const empId = t.assignedTo?._id || t.assignedTo;
    const empName =
      t.assignedTo?.fullName ||
      t.assignedTo?.name ||
      t("unknown");

    if (!acc[empId]) {
      acc[empId] = { name: empName, tasks: [], totalEarn: 0 };
    }

    acc[empId].tasks.push(t.amount || 0);
    acc[empId].totalEarn += t.earn || 0;

    return acc;
  }, {});

  // =====================
  // TABLE BODY
  // =====================
  const tbody = document.createElement("tbody");

  Object.values(tasksByEmployee).forEach((emp, idx) => {
    const row = document.createElement("tr");

    // Employee Name
    const tdName = document.createElement("td");
    tdName.innerText = `${idx + 1}. ${emp.name}`;
    tdName.style.border = "1px solid #444";
    tdName.style.padding = "8px 10px";
    row.appendChild(tdName);

    // Tasks (NO SAR HERE)
    const tdTasks = document.createElement("td");
    tdTasks.innerText = emp.tasks.join(" | ");
    tdTasks.style.border = "1px solid #444";
    tdTasks.style.padding = "8px 10px";
    row.appendChild(tdTasks);

    // Total Earn (WITH SAR)
    const tdTotal = document.createElement("td");
    tdTotal.innerText = `${emp.totalEarn} ر.س`;
    tdTotal.style.border = "1px solid #444";
    tdTotal.style.padding = "8px 10px";
    row.appendChild(tdTotal);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  element.appendChild(table);

  // =====================
  // BOTTOM TOTALS
  // =====================
  const totalTasks = tasksForDay.length;
  const totalAmount = tasksForDay.reduce(
    (sum, t) => sum + (t.amount || 0),
    0
  );
  const totalEarn = tasksForDay.reduce(
    (sum, t) => sum + (t.earn || 0),
    0
  );

  const totalsDiv = document.createElement("div");
  totalsDiv.style.marginTop = "16px";
  totalsDiv.style.fontWeight = "bold";
  totalsDiv.innerText =
    `${t("totalTasks")}: ${totalTasks} | ` +
    `${t("totalAmount")}: ${totalAmount} | ` +
    `${t("totalEarn")}: ${totalEarn} ر.س`;

  element.appendChild(totalsDiv);

  // =====================
  // GENERATE PDF
  // =====================
  html2pdf()
    .from(element)
    .set({
      margin: 10,
      filename: `tasks_${date}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "landscape", unit: "pt", format: "a4" },
    })
    .save();
};


  if (loading)
    return (
      <div className="text-center py-6 text-gray-400">
        {t("loadingHistory")}
      </div>
    );

  if (!history.length)
    return (
      <div className="text-center py-6 text-gray-400">{t("noHistory")}</div>
    );

  const groupedByDate = history.reduce((acc, task) => {
    const dateStr = new Date(task.date || task.createdAt).toLocaleDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div className="space-y-6 max-h-[600px] overflow-y-auto">
      {sortedDates.map((date) => {
        const tasksForDay = groupedByDate[date];
        const totalTasks = tasksForDay.length;
        const totalAmount = tasksForDay.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );
        const totalEarn = tasksForDay.reduce(
          (sum, t) => sum + (t.earn || 0),
          0
        );

        const tasksByEmployee = tasksForDay.reduce((empAcc, t) => {
          const empId = t.assignedTo?._id || t.assignedTo;
          const empName =
            t.assignedTo?.fullName || t.assignedTo?.name || t("unknown");
          if (!empAcc[empId]) empAcc[empId] = { name: empName, tasks: [] };
          empAcc[empId].tasks.push({
            amount: t.amount || 0,
            earn: t.earn || 0,
          });
          return empAcc;
        }, {});

        return (
          <div key={date} className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-gray-700">{date}</p>
              <button
                onClick={() => exportDatePDF(date, tasksForDay)}
                className="bg-teal-800 text-white px-3 py-1 rounded hover:bg-teal-700 text-sm"
              >
                {t("exportPDF")}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3 text-center">
              <div className="bg-white border rounded-xl py-2">
                {t("totalTasks")}: {totalTasks}
              </div>
              <div className="bg-white border rounded-xl py-2">
                {t("totalAmount")}: {totalAmount} ر.س
              </div>
              <div className="bg-white border rounded-xl py-2">
                {t("totalEarn")}: {totalEarn} ر.س
              </div>
            </div>

            {Object.values(tasksByEmployee).map((emp) => {
              const empTotalEarn = emp.tasks.reduce(
                (sum, t) => sum + t.earn,
                0
              );
              return (
                <div
                  key={emp.name}
                  className="flex flex-wrap gap-2 mb-2 items-center"
                >
                  <span className="w-full font-medium text-gray-600">
                    {emp.name}:
                  </span>

                  {/* Tasks (❌ NO SAR HERE) */}
                  {emp.tasks.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-white border rounded-full px-3 py-1 text-sm shadow-sm"
                    >
                      {t.amount}
                    </span>
                  ))}

                  {/* Total Earn (✅ SAR stays) */}
                  <span className="font-bold text-teal-800 ml-2">
                    {t("totalEarn")}: {empTotalEarn} ر.س
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
