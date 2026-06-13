"use client";

import { useLang } from "@/components/LangProvider";

export default function LangToggle() {
  const { lang, toggleLang } = useLang();

  return (
    <div className="lang-toggle">
      <button
        className="icon-button lang-toggle__button"
        onClick={toggleLang}
        title={lang === "zh" ? "Switch to English" : "切换到中文"}
      >
        {lang === "zh" ? "EN" : "中"}
      </button>
    </div>
  );
}
