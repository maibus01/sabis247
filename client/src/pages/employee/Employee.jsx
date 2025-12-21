import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

import ApprovedTasksTab from "./ApprovedTasksTab";
import PendingTasksTab from "./PendingTasksTab";
import EmployeeHistory from "./EmployeeHistory";
import BottomNavbar from "../../components/BottomNavbar";
import Header from "../../components/Header";
import RequestTaskModal from "./RequestTaskModal";

export default function EmployeeProfile() {
  const { teamId, employeeId } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [employee, setEmployee] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("approved");
  const [showRequestTask, setShowRequestTask] = useState(false);
  const [isManagerOrOwner, setIsManagerOrOwner] = useState(false);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const token = user?.token;
  const userId = user?._id;

  if (!token || !userId) {
    return (
      <div className="pt-24 px-6 text-center text-red-500">
        {t("unauthorized")}
      </div>
    );
  }

  // -----------------------------
  // Fetch Employee & Team Members
  // -----------------------------
  const fetchEmployee = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/teams/${teamId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const member = res.data.find((m) => String(m.id) === String(employeeId));
      setEmployee(member);

      // Compute if current user is manager or owner
      const currentUser = res.data.find((m) => String(m.id) === String(userId));
      setIsManagerOrOwner(
        currentUser && ["manager", "owner"].includes(currentUser.role)
      );
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tasks/team/${teamId}/user/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllTasks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchEmployee(), fetchTasks()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
    // eslint-disable-next-line
  }, [employeeId, teamId]);

  // -----------------------------
  // Reject Task Handler
  // -----------------------------
  const handleRejectTask = async (taskId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEmployeeData(); // refresh tasks
    } catch (err) {
      console.error(err);
      alert(t("rejectFailed") || "Failed to reject task");
    }
  };

  if (loading) {
    return (
      <div className="pt-24 text-center text-gray-500">{t("loading")}</div>
    );
  }

  if (!employee) {
    return (
      <div className="pt-24 text-center text-red-500">{t("employeeNotFound")}</div>
    );
  }

  // -----------------------------
  // Role / Permission Checks
  // -----------------------------
  const isSelf = String(userId) === String(employeeId);
  const isEmployee = employee.role === "employee";
  const canRequestTask = isSelf && isEmployee;

  // -----------------------------
  // Task Filters
  // -----------------------------
  const approvedTasks = allTasks.filter((t) => t.status === "approved");
  const pendingTasks = allTasks.filter((t) => t.status !== "approved");

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      <div className="min-h-screen bg-gray-50 pt-24 pb-32 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {employee.fullName}
            </h1>
            <p className="text-sm text-gray-500">{t("employeeProfile")}</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-xl shadow-sm border mb-6 overflow-hidden">
            {[
              { id: "approved", label: t("approvedTasks") },
              { id: "pending", label: t("pendingTasks") },
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
            {activeTab === "approved" && (
              <ApprovedTasksTab
                tasks={approvedTasks}
                isManager={isManagerOrOwner}
                onRejectTask={handleRejectTask}
              />
            )}

            {activeTab === "pending" && (
              <PendingTasksTab tasks={pendingTasks} />
            )}

            {activeTab === "history" && (
              <EmployeeHistory teamId={teamId} employeeId={employeeId} />
            )}
          </div>
        </div>
      </div>

      {/* Request Task Modal (ONLY SELF EMPLOYEE) */}
      {canRequestTask && (
        <RequestTaskModal
          open={showRequestTask}
          onClose={() => setShowRequestTask(false)}
          teamId={teamId}
          employeeId={userId}
          token={token}
          onSuccess={fetchEmployeeData}
        />
      )}

      {/* Floating Request Button (ONLY SELF EMPLOYEE) */}
      {canRequestTask && (
        <button
          onClick={() => setShowRequestTask(true)}
          className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-hybriflow-dark-teal text-white text-3xl shadow-lg hover:scale-105 transition"
        >
          +
        </button>
      )}

      <BottomNavbar />
    </div>
  );
}
