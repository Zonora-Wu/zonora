import type { Metadata } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import LangProvider from "@/components/LangProvider";
import NavHeader from "@/components/NavHeader";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zonora — 个人博客",
  description: "用文字与三维世界记录思考与创造。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LangProvider>
            <NavHeader />
            <PageTransition>{children}</PageTransition>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
