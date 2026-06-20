"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/components/LangProvider";

// 模块级变量：跨 HomePage 重挂载保持 "已揭示" 状态，避免返回首页时提示闪烁
let _navRevealed = false;
export function isNavRevealed() {
  return _navRevealed;
}
function markNavRevealed() {
  _navRevealed = true;
}

const navKeys = ["首页", "博客", "项目", "模型", "绘画", "摄影", "联系"];

const navItems = navKeys.map((key, i) => ({
  href: ["/home", "/blog", "/projects", "/models", "/art", "/photo", "/contact"][i],
  key,
}));

function isNavItemActive(pathname: string, href: string) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  return normalizedPath === href || normalizedPath.startsWith(`${href}/`);
}

export default function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/home";
  const [revealed, setRevealed] = useState(_navRevealed);
  const { t } = useLang();

  // 不在首页时导航栏始终显示
  const visible = !isHome || revealed;

  // 从其他页面返回首页时(非首页路由)，导航栏直接显示挂载
  useEffect(() => {
    if (isHome && revealed) {
      window.dispatchEvent(new CustomEvent("nav-revealed"));
    }
  }, [isHome, revealed]);

  // 全局 prefetch 所有导航链接（idle callback）
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

  // Memoized prefetch handler — avoids creating new closures on every render
  const handlePrefetch = useCallback((href: string) => {
    router.prefetch(href);
  }, [router]);

  useEffect(() => {
    if (!isHome || revealed) return;
    const reveal = () => {
      markNavRevealed();
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
      >
        Zonora
      </Link>
      <nav className="header-nav">
        <ul className="nav">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isNavItemActive(pathname, item.href) ? "nav__link--active" : undefined}
                aria-current={isNavItemActive(pathname, item.href) ? "page" : undefined}
                onPointerEnter={() => handlePrefetch(item.href)}
                onFocus={() => handlePrefetch(item.href)}
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
