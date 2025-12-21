import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

import Header from "../components/Header";
import BottomNavbar from "../components/BottomNavbar";
import EarnRulesEditor from "../components/EarnRulesEditor";

export default function Settings() {
  const { t } = useTranslation();
  const { teamId: routeTeamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [earnRules, setEarnRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const token = user?.token;
  const userId = user?._id;

  // Fetch team data
  const fetchTeam = async (teamId) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeam(res.data);
      localStorage.setItem("currentTeam", JSON.stringify(res.data));
    } catch (err) {
      console.error("Fetch team error:", err);
      alert(t("failedFetchTeam")); // translation key
    } finally {
      setLoading(false);
    }
  };

  // Fetch earn rules
  const fetchEarnRules = async (teamId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/earnRules/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEarnRules(res.data || []);
    } catch (err) {
      console.error("Fetch earn rules error:", err);
      setEarnRules([]);
    }
  };

  // Delete team
  const isOwner = team?.members?.some(
    (m) => m.userId?._id === userId && m.role === "owner"
  );

  const handleDeleteTeam = async () => {
    if (!team?._id) {
      alert(t("teamIdMissing"));
      return;
    }

    const confirmDelete = window.confirm(t("confirmDeleteTeam"));
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/teams/${team._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("currentTeam");
      alert(t("teamDeleted"));
      navigate("/booking-page");
    } catch (err) {
      console.error("Delete team error:", err.response || err);
      alert(err.response?.data?.message || t("failedDeleteTeam"));
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    const storedTeam = JSON.parse(localStorage.getItem("currentTeam"));
    const teamId = routeTeamId || storedTeam?._id;

    if (!teamId) {
      alert(t("selectTeamFirst"));
      navigate("/booking-page");
      return;
    }

    const fetchData = async () => {
      await fetchTeam(teamId);
      await fetchEarnRules(teamId);
    };

    fetchData();
  }, [routeTeamId]);

  if (loading)
    return <p className="p-6 pt-24 text-center text-gray-500 italic">{t("loadingTeamSettings")}</p>;

  if (!team)
    return <p className="p-6 pt-24 text-center text-gray-500 italic">{t("teamNotFound")}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-24 p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center sm:text-left">
          {team.name} - {t("settings")}
        </h1>

        <EarnRulesEditor
          teamId={team._id}
          team={team}
          rules={earnRules}
          refreshRules={() => fetchEarnRules(team._id)}
        />

        {isOwner && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-lg font-semibold text-red-600 mb-4">{t("dangerZone")}</h2>

            <button
              onClick={handleDeleteTeam}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition"
            >
              {t("deleteTeam")}
            </button>

            <p className="text-sm text-gray-500 mt-2">{t("deleteTeamWarning")}</p>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
}
