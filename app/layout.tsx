import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zonora — 个人博客",
  description: "用文字与三维世界记录思考与创造。",
};

const navItems = [
  { href: "/home", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/models", label: "模型" },
  { href: "/art", label: "绘画" },
  { href: "/projects", label: "项目" },
  { href: "/about", label: "关于" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="header container">
          <Link href="/home" className="logo">
            Zonora
          </Link>
          <nav>
            <ul className="nav">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          <p>© {new Date().getFullYear()} Zonora. Built with Next.js & Three.js.</p>
        </footer>
      </body>
    </html>
  );
}
