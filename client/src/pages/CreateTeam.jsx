
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";

export default function CreateTeam() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [user, setUser] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!savedUser) {
      navigate("/login");
      return;
    }
    setUser(savedUser);
  }, [navigate]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!teamName.trim()) return alert(t("enterTeamName"));

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/teams",
        { 
          name: teamName, 
          description, 
          ownerId: user._id 
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert(t("teamCreated", { name: res.data.name }));
      setTeamName("");
      setDescription("");
      navigate(`/`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || t("failedCreateTeam"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${isRTL ? "text-right" : "text-left"}`}>
      <Header />
      <section className="flex-grow flex flex-col items-center justify-center px-6 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-hybriflow-dark-teal text-center mb-6">
          {t("createTeam")}
        </h1>

        <form
          onSubmit={handleCreateTeam}
          className="bg-white p-8 rounded-2xl shadow-sm border w-full max-w-md flex flex-col gap-6"
        >
          <div className="flex flex-col">
            <label htmlFor="teamName" className="font-semibold text-hybriflow-dark-teal mb-1">
              {t("teamName")}
            </label>
            <input
              type="text"
              id="teamName"
              placeholder={t("teamNamePlaceholder")}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-hybriflow-dark-teal outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="description" className="font-semibold text-hybriflow-dark-teal mb-1">
              {t("description")}
            </label>
            <textarea
              id="description"
              placeholder={t("descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-hybriflow-dark-teal outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-3.5 rounded-xl font-semibold bg-hybriflow-dark-teal text-white shadow-md hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? t("creating") : t("createTeam")}
          </button>
        </form>
      </section>
    </div>
  );
}
