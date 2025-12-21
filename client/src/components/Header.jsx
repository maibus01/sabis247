import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLogOut, FiUser, FiLogIn, FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import sabis247Logo from "../assets/sabis247-logo.png";

const Header = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);
  const langRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const isHome = location.pathname === "/";

  // Direction: "ltr" or "rtl"
  const dir = i18n.language === "ar" ? "rtl" : "ltr";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpenProfile(false);
      if (langRef.current && !langRef.current.contains(e.target)) setOpenLang(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthClick = () => {
    if (user) {
      localStorage.removeItem("loggedInUser");
      alert(t("Logged out successfully"));
      navigate("/login");
    } else {
      navigate("/login");
    }
    setOpenProfile(false);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.dir = lang === "ar" ? "rtl" : "ltr";
    setOpenLang(false);
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
  ];

  // Helper for dropdown alignment based on direction
  const dropdownAlign = dir === "rtl" ? "left-0" : "right-0";
  const iconMargin = dir === "rtl" ? "mr-1" : "ml-1";

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white border-b border-gray-200 shadow-md" : "bg-white/0 border-none shadow-none"
      }`}
      dir={dir}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6 sm:px-12">
        {/* Left: Logo / Back */}
       <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
  <img
    src={sabis247Logo}
    alt="Sabis247 Logo"
    className="h-10 w-auto sm:h-12" // adjust height as needed
  />
</div>


        {/* Right: Language + Profile */}
        <div className="flex items-center gap-4">
          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setOpenLang(!openLang)}
              className="flex items-center gap-1 px-3 py-1 rounded border border-gray-300 hover:border-teal-600 transition-colors text-gray-800 font-medium"
            >
              {languages.find((l) => l.code === i18n.language)?.label || "English"}
              <FiChevronDown size={18} className={iconMargin} />
            </button>

            {openLang && (
              <div className={`absolute mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 ${dropdownAlign}`}>
                {languages
                  .filter((l) => l.code !== i18n.language)
                  .map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      {lang.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setOpenProfile(!openProfile)}
              className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-semibold cursor-pointer select-none hover:bg-teal-200 transition-colors"
            >
              {user ? user.name?.[0].toUpperCase() : "U"}
            </div>

            {openProfile && (
              <div
                className={`absolute mt-3 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn ${dropdownAlign}`}
              >
                {/* Top Section */}
                <div className="px-4 py-4 bg-gradient-to-r from-teal-800 to-teal-600 rounded-t-xl text-white flex items-center gap-3 shadow-inner">
                  <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full text-lg font-bold">
                    {user ? user.name[0].toUpperCase() : "G"}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold tracking-wide">
                      {user ? user.name : t("Guest User")}
                    </p>
                    <p className="text-xs text-white/70 flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${user ? "bg-green-400" : "bg-gray-400"}`}
                      />
                      {user ? t("Logged in") : t("Not logged in")}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col divide-y divide-gray-100">
                  {user ? (
                    <>
                      <button
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                        onClick={() => navigate("/profile")}
                      >
                        <FiUser />
                        {t("My Profile")}
                      </button>

                      <button
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        onClick={handleAuthClick}
                      >
                        <FiLogOut />
                        {t("Logout")}
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                      onClick={handleAuthClick}
                    >
                      <FiLogIn />
                      {t("Login")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
