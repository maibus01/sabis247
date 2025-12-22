import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);

  // Set RTL/LTR
  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  // Load user
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!u) {
      navigate("/login");
      return;
    }
    setUser(u);
  }, [navigate]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
  ];

  const changeLanguage = (lang) => i18n.changeLanguage(lang);

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-32 pb-32 relative">
      {/* Language Switcher */}
      <div className={`absolute top-4 ${i18n.language === "ar" ? "left-4" : "right-4"} flex gap-2`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-1 rounded border ${
              i18n.language === lang.code
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            } transition`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-hybriflow-dark-teal mb-6 text-center">
        {t("My Profile")}
      </h1>

      {/* Profile Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-6 text-center">
        <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-4 flex items-center justify-center text-4xl">
          👤
        </div>
        <h2 className="text-xl font-bold">{user.name || user.fullName}</h2>
        <p className="text-gray-500 text-sm">{t("Hybriflow User")}</p>

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-gray-700 text-sm">
            {t("Email")}: <span className="font-medium">{user.email}</span>
          </p>
          <p className="text-gray-700 text-sm">
            {t("Password")}: <span className="font-medium">••••••••</span>
          </p>
        </div>

        <button
          className="mt-4 w-full bg-hybriflow-dark-teal text-white py-2 rounded-xl font-semibold hover:bg-hybriflow-dark-teal/80 transition"
          onClick={() => navigate("/profile/edit")}
        >
          {t("Edit Profile")}
        </button>
      </div>

      {/* Menu List */}
      <div className="space-y-4">
        <div
          className="bg-white shadow rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
          onClick={() => navigate("/create-team")}
        >
          <span className="font-medium">{t("Create Team")}</span>
          <span>➤</span>
        </div>

        <div
          className="bg-white shadow rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
          onClick={() => navigate("/support")}
        >
          <span className="font-medium">{t("Support")}</span>
          <span>➤</span>
        </div>

        <div
          className="bg-white shadow rounded-xl p-4 flex justify-between items-center cursor-pointer text-red-500 hover:bg-red-50 transition"
          onClick={handleLogout}
        >
          <span className="font-medium">{t("Log Out")}</span>
          <span>➤</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
