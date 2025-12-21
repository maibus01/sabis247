import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, Users, Settings } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function BottomNavbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { id: "home", label: t("home"), icon: Home },
    { id: "dashboard", label: t("dashboard"), icon: FileText },
    { id: "members", label: t("members"), icon: Users },
    { id: "settings", label: t("settings"), icon: Settings },
  ];

  useEffect(() => {
    if (location.pathname === "/") setActiveTab("home");
    else if (
      location.pathname.startsWith("/team") &&
      (location.pathname.includes("/dashboard") ||
        location.pathname.includes("/manager") ||
        location.pathname.includes("/supervisor") ||
        location.pathname.includes("/employee") ||
        location.pathname.includes("/member-dashboard"))
    ) {
      setActiveTab("dashboard");
    } else if (location.pathname.includes("/members-page")) {
      setActiveTab("members");
    } else if (location.pathname.includes("/settings")) {
      setActiveTab("settings");
    }
  }, [location.pathname]);

  const openTeamDashboard = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return alert(t("userNotFound"));

    const storedTeam = JSON.parse(localStorage.getItem("currentTeam"));
    if (!storedTeam) return alert(t("teamNotFound"));

    let latestTeam = storedTeam;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/teams/${storedTeam._id}`,
        { headers: { Authorization: `Bearer ${loggedInUser.token}` } }
      );
      latestTeam = res.data;
      localStorage.setItem("currentTeam", JSON.stringify(latestTeam));
    } catch {
      console.warn("Failed to fetch latest team, using cached data.");
    }

    const userId = String(loggedInUser._id);
    const member = latestTeam.members.find(
      (m) => String(m.userId?._id) === userId
    );
    if (!member) return alert(t("notPartOfTeam"));

    switch (member.role?.toLowerCase()) {
      case "owner":
        navigate(`/team/${latestTeam._id}/dashboard`);
        break;
      case "manager":
        navigate(`/team/${latestTeam._id}/manager`);
        break;
      case "supervisor":
        navigate(`/team/${latestTeam._id}/dashboard`);
        break;
      case "employee":
      case "worker":
        navigate(`/team/${latestTeam._id}/employee/${userId}`);
        break;
      default:
        navigate(`/team/${latestTeam._id}/member-dashboard`);
    }
  };

  const handleTabClick = (tabId) => {
    if (tabId === "home") return navigate("/booking-page");

    const storedTeam = JSON.parse(localStorage.getItem("currentTeam"));
    if (!storedTeam) return alert(t("noTeamSelected"));

    switch (tabId) {
      case "dashboard":
        openTeamDashboard();
        break;
      case "members":
        navigate(`/team/${storedTeam._id}/members-page`);
        break;
      case "settings":
        navigate(`/team/${storedTeam._id}/settings`);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="hidden md:block h-16" />

      <nav className="fixed inset-x-0 bottom-0 md:top-auto md:bottom-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around md:justify-center md:gap-6 px-3 py-3 md:px-6 md:py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center md:flex-row md:gap-2 px-3 py-2 rounded-full transition-all ${
                  isActive
                    ? "text-teal-800 bg-teal-50 shadow-inner"
                    : "text-gray-500 hover:text-teal-800 hover:bg-teal-50 transition-colors"
                } cursor-pointer`}
              >
                <Icon size={isActive ? 26 : 22} className={isActive ? "text-teal-800" : ""} />
                <span className="hidden md:inline text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
