export type Project = {
  slug: string;
  name: string;
  description: string;
  detail: string;
  tags: string[];
  tech: string[];
  content: string;
  contentPath?: string;
  image?: string;
  imageAlt?: string;
  icon?: string;
  githubUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "vulnerability-lab",
    name: "漏洞挖掘靶场",
    description: "面向个人安全学习的独立隔离靶场首页，聚焦漏洞挖掘、考核进度和沉浸式练习入口。",
    detail: "Security Lab + CTF Training · 漏洞挖掘 / 靶场入口 / 安全训练界面",
    tags: ["安全", "靶场", "漏洞挖掘", "UI"],
    tech: ["React", "TypeScript", "CSS", "Security Training", "CTF Lab"],
    image: "/projects/vulnerability-lab-home.png",
    imageAlt: "漏洞挖掘靶场首页截图",
    icon: "🔐",
    contentPath: "vulnerability-lab.md",
    content: "",
  },
  {
    slug: "cqupt-src",
    name: "校园漏洞响应与安全学习平台",
    description: "CQUPT-SRC — 连接漏洞响应、学习实践、证书激励与校园安全共建",
    detail: "React + NestJS + Prisma + PostgreSQL + Hermes Agent + DeepSeek · 全栈安全平台",
    tags: ["全栈", "React", "NestJS", "安全"],
    tech: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "NestJS 11", "Prisma", "PostgreSQL", "Redis", "BullMQ", "MinIO", "Docker", "Nginx", "Hermes Agent", "DeepSeek"],
    image: "/projects/cqupt-src.jpg",
    imageAlt: "校园漏洞响应与安全学习平台项目截图",
    contentPath: "cqupt-src.md",
    content:
      "平台采用前后端分离架构，前端基于 React + Vite + Tailwind CSS 构建多角色界面，后端基于 NestJS + Prisma + PostgreSQL 实现模块化 API、RBAC 权限控制、审计日志和 AI Gateway。\n\n" +
      "AI 子系统通过 NestJS AI Gateway 统一代理 Hermes Agent 和 DeepSeek 模型调用，实现上下文注入、敏感信息脱敏、权限隔离和审计记录。支持 AI Knowledge Base 问题沉淀和 Skill Candidate 审核安装链路。\n\n" +
      "同时集成 AI 漏洞自动复测能力，支持 Hermes Direct 和 Runner 两种执行模式，可对弱口令、信息泄露、越权等漏洞进行自动化验证并生成复测报告。",
  },
  {
    slug: "holocubic",
    name: "HoloCubic · 全息小电视",
    description: "基于 ESP32-PICO-D4 的开源桌面小电视 — 从元器件采购、PCB 打样、外壳定制到固件二次开发全链路实践",
    detail: "ESP32-PICO-D4 + LVGL + C++ · 嵌入式全息小电视 / 桌面信息终端",
    tags: ["嵌入式", "ESP32", "C++", "LVGL", "硬件"],
    tech: ["ESP32-PICO-D4", "C++", "LVGL", "FreeRTOS", "Arduino", "PCB Design"],
    image: "/projects/holocubic.jpg",
    imageAlt: "HoloCubic 全息小电视项目照片",
    githubUrl: "https://github.com/peng-zhihui/HoloCubic",
    contentPath: "holocubic.md",
    content: "",
  },
  {
    slug: "zonora",
    name: "个人博客网站",
    description: "Zonora — 用文字、项目与三维视觉记录思考和创造的个人博客网站",
    detail: "Next.js + TypeScript + Three.js · 个人博客 / 作品展示网站",
    tags: ["博客", "Next.js", "TypeScript", "Three.js"],
    tech: ["Next.js", "React", "TypeScript", "Three.js", "React Three Fiber", "CSS"],
    image: "/projects/zonora-blog.png",
    imageAlt: "Zonora 个人博客网站截图",
    icon: "🌐",
    githubUrl: "https://github.com/Zonora-Wu/zonora",
    contentPath: "README.md",
    content:
      "网站采用 Next.js App Router 构建，包含博客、项目、模型、绘画、摄影和联系页面。\n\n" +
      "前端结合 Three.js / React Three Fiber 实现首页三维球形视觉展示，并通过纯 CSS 完成页面切换、响应式布局与整体视觉风格。\n\n" +
      "项目源码托管在 GitHub，可作为个人博客、作品集和前端视觉实验的持续迭代入口。",
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
