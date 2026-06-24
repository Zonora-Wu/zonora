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
  href: ["/", "/blog", "/projects", "/models", "/art", "/photo", "/contact"][i],
  key,
}));

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

function isHomePath(pathname: string) {
  const normalizedPath = normalizePath(pathname);
  return normalizedPath === "/" || normalizedPath === "/home";
}

function isNavItemActive(pathname: string, href: string) {
  const normalizedPath = normalizePath(pathname);
  if (href === "/") return isHomePath(pathname);
  return normalizedPath === href || normalizedPath.startsWith(`${href}/`);
}

export default function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = isHomePath(pathname);
  const [revealed, setRevealed] = useState(_navRevealed);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    const centerActiveLink = () => {
      const activeLink = document.querySelector<HTMLElement>(".nav__link--active");
      const nav = activeLink?.closest<HTMLElement>(".nav");
      if (!activeLink || !nav || nav.scrollWidth <= nav.clientWidth) return;

      const activeItem = activeLink.parentElement;
      const itemLeft = activeItem?.offsetLeft ?? activeLink.offsetLeft;
      const itemWidth = activeItem?.offsetWidth ?? activeLink.offsetWidth;
      nav.scrollLeft = itemLeft - (nav.clientWidth - itemWidth) / 2;
    };

    centerActiveLink();
    const timer = window.setTimeout(centerActiveLink, 150);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".webgl-glass-header, .mobile-nav-orb")) return;
      setMobileNavOpen(false);
    };
    const closeOnScroll = () => setMobileNavOpen(false);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      window.removeEventListener("scroll", closeOnScroll);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileNavOpen]);

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
    <>
      <header
        className={`header container home-header webgl-glass-header ${visible ? "home-header--revealed" : "home-header--hidden"} ${mobileNavOpen ? "mobile-nav--open" : ""}`}
        onClick={(event) => {
          const target = event.target;
          if (target instanceof Element && target.closest("a, button")) {
            setMobileNavOpen(false);
          }
        }}
      >
        <Link
          href="/"
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

      <button
        type="button"
        className={`mobile-nav-orb${mobileNavOpen ? " mobile-nav-orb--hidden" : ""}`}
        aria-label="打开导航菜单"
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen(true)}
      >
        <img
          src="/brand/zonora-mark.png"
          width="15"
          height="27"
          alt=""
          aria-hidden="true"
        />
      </button>
    </>
  );
}
