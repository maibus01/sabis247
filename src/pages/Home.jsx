import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TrendingUp, TrendingDown } from "lucide-react";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";

export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [teams, setTeams] = useState([]);
  const [user, setUser] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);

  const [teamRevenue, setTeamRevenue] = useState({});
  const [loadingRevenue, setLoadingRevenue] = useState({});

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login");
      return;
    }
    setUser(loggedInUser);
    fetchTeams(loggedInUser.token);
  }, [navigate]);

  const fetchTeams = async (token) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/teams/user/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTeams(res.data);

      res.data.forEach((team) => {
        if (!teamRevenue[team._id]) {
          fetchTeamRevenue(team._id, token);
        }
      });
    } catch (err) {
      console.error(err);
      alert(t("failedLoadTeams"));
    }
  };

  const fetchTeamRevenue = async (teamId, token) => {
    setLoadingRevenue((p) => ({ ...p, [teamId]: true }));

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tasks/team/${teamId}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let todayRevenue = 0;
      let yesterdayRevenue = 0;

      res.data.forEach((t) => {
        if (t.status !== "approved") return;

        const d = new Date(t.date || t.createdAt);
        d.setHours(0, 0, 0, 0);

        const rev = (t.amount || 0) - (t.earn || 0);

        if (d.getTime() === today.getTime()) todayRevenue += rev;
        if (d.getTime() === yesterday.getTime()) yesterdayRevenue += rev;
      });

      setTeamRevenue((prev) => ({
        ...prev,
        [teamId]: {
          today: todayRevenue,
          yesterday: yesterdayRevenue,
        },
      }));
    } catch (err) {
      console.error("Revenue fetch failed:", err);
    } finally {
      setLoadingRevenue((p) => ({ ...p, [teamId]: false }));
    }
  };

  const openTeam = (team) => {
    localStorage.setItem("currentTeam", JSON.stringify(team));
    const userId = String(user._id);
    const member = team.members.find(
      (m) => String(m.userId?._id) === userId
    );
    if (!member) return alert(t("notPartTeam"));

    switch (member.role?.toLowerCase()) {
      case "owner":
        navigate(`/team/${team._id}/dashboard`);
        break;
      case "manager":
        navigate(`/team/${team._id}/manager`);
        break;
      case "supervisor":
        navigate(`/team/${team._id}/dashboard`);
        break;
      case "employee":
      case "worker":
        navigate(`/team/${team._id}/employee/${userId}`);
        break;
      default:
        navigate(`/team/${team._id}/member-dashboard`);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) return alert(t("enterInviteCode"));
    setLoadingJoin(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/invites/join`,
        { code: inviteCode },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert(t("joinedTeam", { role: res.data.role }));
      setInviteCode("");
      fetchTeams(user.token);
    } catch (err) {
      alert(err.response?.data?.error || t("failedJoinTeam"));
    } finally {
      setLoadingJoin(false);
    }
  };

  return (
    <>
      <Header />

      <div className={`min-h-screen bg-gray-50 pt-24 pb-32 px-4 ${isRTL ? "text-right" : "text-left"}`}>
        <div className="max-w-6xl mx-auto">

          {/* Join Team */}
          <div className="mb-6 flex justify-center gap-3">
            <input
              type="text"
              placeholder={t("enterInviteCode")}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full max-w-xl px-4 py-2 rounded-full border shadow-sm"
            />
            <button
              onClick={handleJoinTeam}
              disabled={loadingJoin}
              className="px-6 py-2 rounded-full bg-hybriflow-dark-teal text-white"
            >
              {loadingJoin ? t("joining") : t("join")}
            </button>
          </div>

          {/* Teams */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
  {teams.map((team) => {
    const revenue = teamRevenue[team._id];
    const isLoading = loadingRevenue[team._id];
    const trendUp = revenue && revenue.today >= revenue.yesterday;

    return (
      <div
        key={team._id}
        onClick={() => openTeam(team)}
        className="rounded-2xl shadow-sm cursor-pointer overflow-hidden hover:shadow-md transition bg-white"
      >
        {/* Header */}
        <div className="bg-teal-50 p-5">
          <div className="flex justify-between items-start">
            {/* Team info */}
            <div className="pr-2">
              <h2 className="text-2xl font-extrabold text-hybriflow-dark-teal">
                {team.name}
              </h2>
              <p className="text-sm text-hybriflow-dark-teal mt-1 line-clamp-2">
                {team.description || "No description"}
              </p>
            </div>

            {/* Revenue badge */}
            {isLoading ? (
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
            ) : (
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow text-sm font-bold text-teal-700">
                ${revenue?.today?.toLocaleString() || 0}
                {trendUp ? (
                  <TrendingUp size={14} className="text-green-600" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-hybriflow-dark-teal p-4 text-white font-semibold">
          {team.ownerName || "Owner"}
        </div>
      </div>
    );
  })}
</div>

        </div>
      </div>
    </>
  );
}
