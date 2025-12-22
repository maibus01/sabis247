import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function Register() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleRegister = async (e) => {
  e.preventDefault();
  const { name, email, password } = formData;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    alert(t("All fields are required"));
    return;
  }

  if (password.length < 6) {
    alert(t("Password must be at least 6 characters"));
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    alert(t("Please enter a valid email"));
    return;
  }

  setLoading(true);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/users/register`,
      {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      },
      {
        timeout: 25000,
        headers: { "Content-Type": "application/json" },
      }
    );

    localStorage.setItem("loggedInUser", JSON.stringify(res.data));
    alert(t("Registration successful"));
    navigate("/login");
  } catch (error) {
    console.error("REGISTER ERROR:", error.response?.data || error.message);
    alert(
      error.response?.data?.message ||
      error.message ||
      "Registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};



  const languages = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
  ];

  const changeLanguage = (lang) => i18n.changeLanguage(lang);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 relative">
      {/* Language Switcher */}
      <div
        className={`absolute top-4 ${
          i18n.language === "ar" ? "left-4" : "right-4"
        } flex gap-2`}
      >
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {t("Create Account")}
        </h1>
        <p className="text-gray-500 mt-1">{t("Join your team in seconds")}</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-6 space-y-5"
      >
        <input
          type="text"
          name="name"
          placeholder={t("Full name")}
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-hybriflow-dark-teal outline-none"
        />

        <input
          type="text" // allow Arabic characters
          name="email"
          placeholder={t("Email address")}
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-hybriflow-dark-teal outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder={t("Password (min 6 chars)")}
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-hybriflow-dark-teal outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-hybriflow-dark-teal text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? t("Creating account...") : t("Register")}
        </button>

        <p className="text-center text-sm text-gray-500">
          {t("Already have an account?")}{" "}
          <Link
            to="/login"
            className="text-hybriflow-dark-teal font-medium hover:underline"
          >
            {t("Login")}
          </Link>
        </p>
      </form>
    </div>
  );
}
