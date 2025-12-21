import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiSettings, FiUser, FiFileText, FiArrowLeft, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";

export default function Navbar({ business }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!business) return null;

  const links = [
    { name: "Dashboard", to: `/business/${business.id}/dashboard`, icon: <FiHome /> },
    { name: "Members", to: `/business/${business.id}/members`, icon: <FiUsers /> },
    { name: "Logs", to: `/business/${business.id}/logs`, icon: <FiFileText /> },
    { name: "Settings", to: `/business/${business.id}/setting`, icon: <FiSettings /> },
    { name: "Profile", to: `/business/${business.id}/profile`, icon: <FiUser /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <nav className="hidden md:flex justify-between items-center px-6 py- bg-white shadow-md fixed top-0 left-0 w-full z-50">
        {/* Left: Back button + Logo */}
        <div className="flex items-center gap-3">
          <Link to="/profile" className="text-2xl text-hybriflow-dark-teal">
            <FiArrowLeft />
          </Link>
          <img
            src={business.profileImage || "/placeholder-logo.png"}
            alt={business.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-xl font-bold text-hybriflow-dark-teal">{business.name}</span>
        </div>

        {/* Right: Links */}
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className={`flex items-center gap-1 font-medium transition-colors duration-300 ${
                isActive(link.to)
                  ? "text-hybriflow-light-blue border-b-2 border-hybriflow-light-blue"
                  : "text-hybriflow-dark-teal hover:text-hybriflow-light-blue"
              }`}
            >
              {link.name} {link.icon}
            </Link>
          ))}
        </div>
      </nav>

      {/* Top padding for desktop so content doesn't overlap navbar */}
      <div className="hidden md:block h-20"></div>

      {/* MOBILE NAVBAR */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-md fixed top-0 w-full z-50">
        <Link to="/profile" className="text-2xl text-hybriflow-dark-teal">
          <FiArrowLeft />
        </Link>
        <div className="flex items-center gap-3">
          <img
            src={business.profileImage || "/placeholder-logo.png"}
            alt={business.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-semibold text-hybriflow-dark-teal">{business.name}</span>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="text-3xl text-hybriflow-dark-teal focus:outline-none"
        >
          <FiMenu />
        </button>
      </div>

      {/* Mobile sidebar backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 p-6 flex flex-col gap-6 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="text-3xl text-hybriflow-dark-teal self-end"
        >
          <FiX />
        </button>

        {links.map((link) => (
          <Link
            key={link.name}
            to={link.to}
            className={`flex items-center gap-1 text-lg font-medium transition-colors duration-300 ${
              isActive(link.to)
                ? "text-hybriflow-light-blue"
                : "text-hybriflow-dark-teal hover:text-hybriflow-light-blue"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {link.name} {link.icon}
          </Link>
        ))}
      </div>

      {/* Mobile bottom padding */}
      <div className="md:hidden h-16"></div>
    </>
  );
}
