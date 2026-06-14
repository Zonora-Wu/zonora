import { notFound } from "next/navigation";
import Link from "next/link";

const projects: Record<string, { name: string; description: string; tech: string[]; content: string; githubUrl?: string }> = {
  "cqupt-src": {
    name: "校园漏洞响应与安全学习平台",
    description: "CQUPT-SRC 是面向高校场景的漏洞响应与安全学习平台，覆盖漏洞提交、审核流转、积分商城、证书激励、AI 助手等模块。",
    tech: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "NestJS 11", "Prisma", "PostgreSQL", "Redis", "BullMQ", "MinIO", "Docker", "Nginx", "Hermes Agent", "DeepSeek"],
    content: "平台采用前后端分离架构，前端基于 React + Vite + Tailwind CSS 构建多角色界面，后端基于 NestJS + Prisma + PostgreSQL 实现模块化 API、RBAC 权限控制、审计日志和 AI Gateway。\n\nAI 子系统通过 NestJS AI Gateway 统一代理 Hermes Agent 和 DeepSeek 模型调用，实现上下文注入、敏感信息脱敏、权限隔离和审计记录。支持 AI Knowledge Base 问题沉淀和 Skill Candidate 审核安装链路。\n\n同时集成 AI 漏洞自动复测能力，支持 Hermes Direct 和 Runner 两种执行模式，可对弱口令、信息泄露、越权等漏洞进行自动化验证并生成复测报告。",
  },
  zonora: {
    name: "个人博客网站",
    description: "Zonora 是一个基于 Next.js 构建的个人博客与作品展示网站，用于记录技术文章、项目实践、三维可视化探索和个人创作。",
    tech: ["Next.js", "React", "TypeScript", "Three.js", "React Three Fiber", "CSS"],
    githubUrl: "https://github.com/Zonora-Wu/zonora",
    content: "网站采用 Next.js App Router 构建，包含博客、项目、模型、绘画、摄影和联系页面。\n\n前端结合 Three.js / React Three Fiber 实现首页三维球形视觉展示，并通过纯 CSS 完成页面切换、响应式布局与整体视觉风格。\n\n项目源码托管在 GitHub，可作为个人博客、作品集和前端视觉实验的持续迭代入口。",
  },
};

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects[slug];
  if (!project) notFound();

  return (
    <section className="page-section page-section--wide">
      <Link href="/projects" className="back-link">
        ← 返回项目
      </Link>

      <h1 className="detail-title">
        {project.name}
      </h1>
      <p className="detail-lead">
        {project.description}
      </p>

      <div className="tag-row">
        {project.tech.map((t) => (
          <span key={t} className="tag tag--detail">{t}</span>
        ))}
      </div>

      {project.githubUrl && (
        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="external-project-link">
          查看 GitHub 仓库 →
        </a>
      )}

      <div className="detail-copy">
        {project.content}
      </div>
    </section>
  );
}
