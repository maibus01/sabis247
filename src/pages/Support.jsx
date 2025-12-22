import Header from "../components/Header";
import BottomNavbar from "../components/BottomNavbar";
import { FaWhatsapp, FaFacebook, FaEnvelope } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Support() {
  const { t } = useTranslation();

  const WHATSAPP_NUMBER = "+966590989983"; // replace with your number
  const EMAIL = "sabis247@gmail.com";
  const FACEBOOK_URL = "https://facebook.com/yourpage";

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="py-24 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-teal-800 mb-6 text-center">
          🆘 {t("support")}
        </h1>

        <p className="text-gray-600 text-center mb-10">
          {t("supportDescription")}
        </p>

        <div className="space-y-4">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <FaWhatsapp className="text-green-500 text-2xl" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {t("whatsappSupport")}
                </h2>
                <p className="text-gray-500 text-sm">{t("chatWithUs")}</p>
              </div>
            </div>
            <span className="text-green-600 font-bold">{t("open")}</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-blue-500 text-2xl" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {t("emailSupport")}
                </h2>
                <p className="text-gray-500 text-sm">{EMAIL}</p>
              </div>
            </div>
            <span className="text-blue-600 font-bold">{t("send")}</span>
          </a>

          {/* Facebook */}
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <FaFacebook className="text-indigo-600 text-2xl" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {t("facebookPage")}
                </h2>
                <p className="text-gray-500 text-sm">{t("messageUsFacebook")}</p>
              </div>
            </div>
            <span className="text-indigo-600 font-bold">{t("visit")}</span>
          </a>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
