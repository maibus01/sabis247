import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

import BottomNavbar from "../../components/BottomNavbar";
import Header from "../../components/Header";

import EmployeesTab from "./EmployeeTab";
import RequestsTab from "./RequestTab";
import History from "../History";

export default function Manager() {
  const { teamId } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [activeTab, setActiveTab] = useState("employees");

  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState({
    totalTasks: 0,
    totalAmount: 0,
    totalEarn: 0,
  });

  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;

  if (!token) {
    return (
      <div className="pt-24 px-6 text-red-500">
        {t("unauthorized")}
      </div>
    );
  }

  // -----------------------------
  // Fetch Employees
  // -----------------------------
  const fetchEmployees = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/teams/${teamId}/members`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.filter((m) => m.role === "employee");
  };

  // -----------------------------
  // Fetch Requests
  // -----------------------------
  const fetchRequests = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/tasks/requests/${teamId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRequests(res.data);
  };

  // -----------------------------
  // Fetch Today Summary
  // -----------------------------
  const fetchTodaySummary = async (employeesList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalTasks = 0;
    let totalAmount = 0;
    let totalEarn = 0;

    await Promise.all(
      employeesList.map(async (emp) => {
        const res = await axios.get(
          `http://localhost:5000/api/tasks/team/${teamId}/history?userId=${emp.id}`,
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

        totalTasks += todayTasks.length;
        totalAmount += todayTasks.reduce((s, t) => s + (t.amount || 0), 0);
        totalEarn += todayTasks.reduce((s, t) => s + (t.earn || 0), 0);
      })
    );

    setSummary({ totalTasks, totalAmount, totalEarn });
  };

  // -----------------------------
  // Load all dashboard data
  // -----------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const employeesList = await fetchEmployees();
      setEmployees(employeesList);

      await fetchRequests();
      await fetchTodaySummary(employeesList);

      setLoading(false);
    };

    loadData();
  }, [teamId]);

  if (loading) {
    return (
      <div className="pt-24 text-center text-gray-500">
        {t("loading")}
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      <div className="min-h-screen bg-gray-50 pt-24 pb-32 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {t("managerDashboard")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("teamOverview")}
            </p>
          </div>

          {/* Today Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">
                {t("totalTasksToday")}
              </p>
              <p className="text-2xl font-bold">
                {summary.totalTasks}
              </p>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">
                {t("totalAmountToday")}
              </p>
              <p className="text-2xl font-bold">
                {summary.totalAmount} ر.س
              </p>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">
                {t("totalEarnToday")}
              </p>
              <p className="text-2xl font-bold">
                {summary.totalEarn} ر.س
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-xl shadow-sm border mb-6 overflow-hidden">
            {[
              { id: "employees", label: t("employees") },
              { id: "requests", label: t("requests") },
              { id: "history", label: t("history") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-hybriflow-dark-teal text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            {activeTab === "employees" && <EmployeesTab teamId={teamId} />}
            {activeTab === "requests" && (
              <RequestsTab
                requests={requests}
                refreshRequests={fetchRequests}
              />
            )}
            {activeTab === "history" && <History teamId={teamId} />}
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
