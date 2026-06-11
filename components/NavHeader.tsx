"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { href: "/home", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/projects", label: "项目" },
  { href: "/models", label: "模型" },
  { href: "/art", label: "绘画" },
  { href: "/photo", label: "摄影" },
  { href: "/contact", label: "联系" },
];

export default function NavHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/home";
  const [revealed, setRevealed] = useState(!isHome);

  useEffect(() => {
    if (!isHome || revealed) return;
    const reveal = () => setRevealed(true);
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "F5" || e.key === "F12") return;
      e.preventDefault();
      reveal();
    };
    window.addEventListener("keydown", keyHandler);
    window.addEventListener("click", reveal);
    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("click", reveal);
    };
  }, [isHome, revealed]);

  return (
    <header
      className="header container"
      style={{
        position: "relative",
        zIndex: 10,
        transform: revealed ? "translateY(0)" : "translateY(-100%)",
        opacity: revealed ? 1 : 0,
        transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
      }}
    >
      <Link href="/home" className="logo">Zonora</Link>
      <nav style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <ul className="nav">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </nav>
    </header>
  );
}
