import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function Login() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Set document direction
  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      alert(t("Please enter both email and password"));
      return;
    }

    // Simple email validation (ASCII + Unicode domains)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
    if (!emailRegex.test(email)) {
      alert(t("Please enter a valid email"));
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        formData
      );

      const user = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        token: res.data.token,
        photo: res.data.photo || null,
      };

      localStorage.setItem("loggedInUser", JSON.stringify(user));

      if (res.data.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || t("Login failed"));
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t("Welcome Back")}</h1>
        <p className="text-gray-500 mt-1">{t("Sign in to continue")}</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-6 space-y-5"
      >
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
          placeholder={t("Password")}
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
          {loading ? t("Logging in...") : t("Login")}
        </button>

        <p className="text-center text-sm text-gray-500">
          {t("Don’t have an account?")}{" "}
          <Link to="/register" className="text-hybriflow-dark-teal font-medium hover:underline">
            {t("Register")}
          </Link>
        </p>
      </form>
    </div>
  );
}
