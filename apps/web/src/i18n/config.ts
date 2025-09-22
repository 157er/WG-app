import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import de from "../../public/locales/de/common.json";
import en from "../../public/locales/en/common.json";

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
    },
    fallbackLng: "de",
    lng: navigator.language.startsWith("de") ? "de" : "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
