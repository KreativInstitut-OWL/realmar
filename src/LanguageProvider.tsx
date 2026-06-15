import React, { createContext, useContext, ReactNode, useState } from "react";
import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import zh from "./locales/zh.json";

const dictionaries: Record<string, Record<string, string>> = { ar, de, en, es, fr, hi, zh };

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, ...args: (string | number)[]) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<string>(() => {
    const browserLang = typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "en";
    return dictionaries[browserLang] ? browserLang : "en";
  });

  const t = (key: string, ...args: (string | number)[]) => {
    const dict = dictionaries[language] || dictionaries["en"];
    let text = dict[key] || key;
    args.forEach((arg, i) => {
      text = text.replace(`{${i}}`, String(arg));
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
