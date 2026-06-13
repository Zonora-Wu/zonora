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
    <section className="page-section">
      <h1 className="page-title">项目</h1>
      <p className="page-lead">
        全栈开发、安全研究与三维可视化项目。
      </p>

      <div className="card-grid">
        {projects.map((proj) => (
          <ProjectCard key={proj.slug} {...proj} />
        ))}
      </div>
    </section>
  );
}
