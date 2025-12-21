import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Members from "../components/Members";
import BottomNavbar from "../components/BottomNavbar";
import { useTranslation } from "react-i18next";

export default function MembersPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { teamId: routeTeamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const [inviteCode, setInviteCode] = useState(null);
  const [inviteRole, setInviteRole] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login");
      return;
    }
    setUserId(loggedInUser._id);
    setUserToken(loggedInUser.token);
    setCurrentUserRole(loggedInUser.role?.toLowerCase() || null);

    const storedTeam = JSON.parse(localStorage.getItem("currentTeam"));
    const teamId = routeTeamId || storedTeam?._id;

    if (!teamId) {
      alert(t("selectTeamFirst"));
      navigate("/booking-page");
      return;
    }

    const fetchTeam = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams/${teamId}`, {
          headers: { Authorization: `Bearer ${loggedInUser.token}` },
        });
        setTeam(res.data);
        localStorage.setItem("currentTeam", JSON.stringify(res.data));
      } catch (err) {
        console.error(err);
        alert(t("failedFetchTeam"));
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [navigate, routeTeamId, t]);

  const handleInvite = async (role) => {
    if (!team) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/invites/create`,
        { teamId: team._id, role },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const code = res.data.code;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }

      setInviteCode(code);
      setInviteRole(role);
      setShowInviteModal(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || t("failedSendInvite"));
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!team || !memberId) return;

    const confirmDelete = window.confirm(t("confirmRemoveMember"));
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/teams/${team._id}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      setTeam((prev) => ({
        ...prev,
        members: prev.members.filter((m) => String(m.userId?._id) !== String(memberId)),
      }));

      alert(t("memberRemoved"));
    } catch (err) {
      console.error("Remove member error:", err);
      alert(err.response?.data?.error || t("failedRemoveMember"));
    }
  };

  if (loading) return <p className="p-6 pt-24 text-center text-gray-500 italic">{t("loadingMembers")}</p>;
  if (!team) return <p className="p-6 pt-24 text-center text-gray-500 italic">{t("teamNotFound")}</p>;

  return (
    <div className={`min-h-screen bg-gray-100 ${isRTL ? "text-right" : "text-left"}`}>
      <Header />

      <div className="py-24 p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-teal-800 mb-8 text-center sm:text-left">
          {team.name} - {t("members")}
        </h1>

        <Members
          members={team.members || []}
          currentUserId={userId}
          currentUserRole={currentUserRole}
          onInvite={handleInvite}
          onRemove={handleRemoveMember}
        />
      </div>

      <BottomNavbar />

      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 sm:w-96">
            <h2 className="text-xl font-bold text-teal-800 mb-4 text-center">
              {t("inviteCodeFor")} {inviteRole}
            </h2>
            <p className="mb-6 text-center font-mono text-lg bg-teal-50 p-3 rounded">{inviteCode}</p>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-teal-800 text-white py-2 rounded hover:bg-teal-700 transition-colors"
                onClick={() => navigator.clipboard.writeText(inviteCode)}
              >
                {t("copyAgain")}
              </button>
              <button
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setShowInviteModal(false)}
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
