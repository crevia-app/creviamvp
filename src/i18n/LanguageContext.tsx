import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import en from "./translations/en";
import sw from "./translations/sw";
import fr from "./translations/fr";
import ar from "./translations/ar";
import de from "./translations/de";
import es from "./translations/es";
import it from "./translations/it";
import pt from "./translations/pt";

type TranslationKeys = keyof typeof en;
type Translations = Record<string, Record<string, string>>;

const translations: Translations = { en, sw, fr, ar, de, es, it, pt };

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  isRTL: false,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("crevia-language") || "en";
  });

  const isRTL = language === "ar";

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("crevia-language", lang);
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] || translations.en[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
