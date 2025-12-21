import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import Header from "../components/Header";
import BottomNavbar from "../components/BottomNavbar";
import Revenue from "../components/Revenue";
import EmployeeTable from "../components/EmployeesTable";

export default function OwnerDashboard() {
  const { t } = useTranslation();
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 filter state
  const [days, setDays] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const filters = [
    { label: t("today"), value: 1 },
    { label: t("last7days"), value: 7 },
    { label: t("last10days"), value: 10 },
    { label: t("last30days"), value: 30 },
  ];

  const activeFilter = filters.find(f => f.value === days)?.label;

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    setUser(loggedInUser);
    fetchTeam(loggedInUser.token);
    // eslint-disable-next-line
  }, [teamId]);

  const fetchTeam = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/teams/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeam(res.data);
    } catch (err) {
      console.error(err);
      alert(t("failedFetchTeam"));
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <p className="p-6 pt-24 text-center text-gray-500 italic">
        {t("loadingTeam")}
      </p>
    );

  if (!team)
    return (
      <p className="p-6 pt-24 text-center text-gray-500 italic">
        {t("teamNotFound")}
      </p>
    );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 pt-24 pb-24">
        <div className="max-w-6xl mx-auto px-4">

          {/* 🔹 TOP BAR */}
          <div className="flex justify-end mb-4 relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-teal-800 font-medium"
            >
              {t("filter")}: {activeFilter}
              <ChevronDown size={16} />
            </button>

            {/* 🔹 FILTER POPUP */}
            {showFilter && (
              <div className="absolute top-8 right-0 bg-white rounded-xl shadow-lg border w-44 z-50">
                {filters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setDays(f.value);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 transition ${
                      days === f.value
                        ? "text-teal-800 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 🔹 REVENUE */}
          <div className="mb-6">
            <Revenue teamId={teamId} days={days} />
          </div>

          {/* 🔹 EMPLOYEES */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-teal-800">
                {t("employees")}
              </h2>

              <button
                onClick={() => navigate(`/team/${team._id}/manager`)}
                className="bg-teal-800 text-white px-4 py-2 rounded-full text-sm hover:bg-teal-700"
              >
                {t("overview")}
              </button>
            </div>

            <EmployeeTable teamId={teamId} days={days} />
          </div>

        </div>
      </div>

      <BottomNavbar />
    </>
  );
}
