import { notFound } from "next/navigation";
import Link from "next/link";

const projects: Record<string, { name: string; description: string; tech: string[]; content: string }> = {
  "cqupt-src": {
    name: "校园漏洞响应与安全学习平台",
    description: "CQUPT-SRC 是面向高校场景的漏洞响应与安全学习平台，覆盖漏洞提交、审核流转、积分商城、证书激励、AI 助手等模块。",
    tech: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "NestJS 11", "Prisma", "PostgreSQL", "Redis", "BullMQ", "MinIO", "Docker", "Nginx", "Hermes Agent", "DeepSeek"],
    content: "平台采用前后端分离架构，前端基于 React + Vite + Tailwind CSS 构建多角色界面，后端基于 NestJS + Prisma + PostgreSQL 实现模块化 API、RBAC 权限控制、审计日志和 AI Gateway。\n\nAI 子系统通过 NestJS AI Gateway 统一代理 Hermes Agent 和 DeepSeek 模型调用，实现上下文注入、敏感信息脱敏、权限隔离和审计记录。支持 AI Knowledge Base 问题沉淀和 Skill Candidate 审核安装链路。\n\n同时集成 AI 漏洞自动复测能力，支持 Hermes Direct 和 Runner 两种执行模式，可对弱口令、信息泄露、越权等漏洞进行自动化验证并生成复测报告。",
  },
};

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects[slug];
  if (!project) notFound();

  return (
    <section style={{ padding: "3rem 0 4rem", maxWidth: "800px" }}>
      <Link href="/projects" style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1.5rem", display: "inline-block" }}>
        ← 返回项目
      </Link>

      <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
        {project.name}
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
        {project.description}
      </p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {project.tech.map((t) => (
          <span key={t} className="tag" style={{ fontSize: "0.8rem" }}>{t}</span>
        ))}
      </div>

      <div style={{ color: "var(--fg)", lineHeight: 1.8, whiteSpace: "pre-line" }}>
        {project.content}
      </div>
    </section>
  );
}
