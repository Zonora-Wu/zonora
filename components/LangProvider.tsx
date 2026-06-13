"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Lang = "zh" | "en";

const translations: Record<string, Record<Lang, string>> = {
  "首页": { zh: "首页", en: "Home" },
  "博客": { zh: "博客", en: "Blog" },
  "项目": { zh: "项目", en: "Projects" },
  "模型": { zh: "模型", en: "Models" },
  "绘画": { zh: "绘画", en: "Art" },
  "摄影": { zh: "摄影", en: "Photo" },
  "联系": { zh: "联系", en: "Contact" },
  "你好，我是 Zonora": { zh: "你好，我是 Zonora", en: "Hello, I'm Zonora" },
  "探索未知 · 记录创造": { zh: "探索未知 · 记录创造", en: "Explore · Create · Record" },
  "PRESS ANY KEY": { zh: "PRESS ANY KEY", en: "PRESS ANY KEY" },
};

const LangContext = createContext<{
  lang: Lang;
  t: (key: string) => string;
  toggleLang: () => void;
}>({ lang: "zh", t: (k) => k, toggleLang: () => {} });

export function useLang() {
  return useContext(LangContext);
}

export { LangContext };
export { translations };

function getBrowserLang(): Lang {
  if (typeof window === "undefined") return "zh";

  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const primary = languages.find(Boolean)?.toLowerCase() ?? "zh";

  return primary.startsWith("zh") ? "zh" : "en";
}

export default function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const syncBrowserLang = () => setLang(getBrowserLang());

    syncBrowserLang();
    window.addEventListener("languagechange", syncBrowserLang);

    return () => window.removeEventListener("languagechange", syncBrowserLang);
  }, []);

  const t = useCallback((key: string) => {
    return translations[key]?.[lang] ?? key;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((l) => (l === "zh" ? "en" : "zh"));
  }, []);

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}
