"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/components/LangProvider";

const navKeys = ["首页", "博客", "项目", "模型", "绘画", "摄影", "联系"];

const navItems = navKeys.map((key, i) => ({
  href: ["/home", "/blog", "/projects", "/models", "/art", "/photo", "/contact"][i],
  key,
}));

export default function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/home";
  const [revealed, setRevealed] = useState(false);
  const { t } = useLang();

  // 不在首页时导航栏始终显示
  const visible = !isHome || revealed;

  // 从其他页面返回首页时(非首页路由)，导航栏直接显示挂载
  useEffect(() => {
    if (isHome && revealed) {
      window.dispatchEvent(new CustomEvent("nav-revealed"));
    }
  }, [isHome, revealed]);

  useEffect(() => {
    const prefetchAll = () => {
      navItems.forEach((item) => router.prefetch(item.href));
    };
    const win = window as Window & typeof globalThis & {
      requestIdleCallback?: (callback: IdleRequestCallback) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof win.requestIdleCallback === "function" && typeof win.cancelIdleCallback === "function") {
      const idleId = win.requestIdleCallback(prefetchAll);
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(prefetchAll, 300);
    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!isHome || revealed) return;
    const reveal = () => {
      setRevealed(true);
      window.dispatchEvent(new CustomEvent("nav-revealed"));
    };
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
      className={`header container home-header webgl-glass-header ${visible ? "home-header--revealed" : "home-header--hidden"}`}
    >
      <Link
        href="/home"
        className="logo"
        prefetch
        onPointerEnter={() => router.prefetch("/home")}
        onFocus={() => router.prefetch("/home")}
      >
        Zonora
      </Link>
      <nav className="header-nav">
        <ul className="nav">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                onPointerEnter={() => router.prefetch(item.href)}
                onFocus={() => router.prefetch(item.href)}
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
        <LangToggle />
        <ThemeToggle />
      </nav>
    </header>
  );
}
