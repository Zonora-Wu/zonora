import ProjectCard from "@/components/ProjectCard";

const projects = [
  {
    slug: "cqupt-src",
    name: "校园漏洞响应与安全学习平台",
    description: "CQUPT-SRC — 连接漏洞响应、学习实践、证书激励与校园安全共建",
    detail: "React + NestJS + Prisma + PostgreSQL + Hermes Agent + DeepSeek · 全栈安全平台",
    tags: ["全栈", "React", "NestJS", "安全"],
  },
];

export default function ProjectsPage() {
  return (
    <section style={{ padding: "3rem 0 4rem" }}>
      <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>项目</h1>
      <p style={{ color: "var(--muted)", fontSize: "1.05rem", marginBottom: "2.5rem" }}>
        全栈开发、安全研究与三维可视化项目。
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {projects.map((proj) => (
          <ProjectCard key={proj.slug} {...proj} />
        ))}
      </div>
    </section>
  );
}
