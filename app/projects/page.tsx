import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";

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
