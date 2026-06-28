import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownArticle from "@/components/MarkdownArticle";
import { getProject, projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const markdownContent = project.contentPath
    ? normalizeReadmeMarkdown(await readProjectMarkdown(project.contentPath))
    : null;

  return (
    <section className="page-section page-section--wide project-detail-page">
      <Link href="/projects" className="back-link">
        ← 返回项目
      </Link>

      <div className="project-detail-hero">
        <div className="project-detail-hero__copy">
          <span className="project-detail-hero__eyebrow">{project.tags[0]} · Project</span>
          <h1 className="detail-title">
            {project.name}
          </h1>
          <p className="detail-lead">
            {project.description}
          </p>
        </div>

        {project.image ? (
          <figure className="project-detail-cover">
            <img
              src={project.image}
              alt={project.imageAlt ?? project.name}
              className="project-detail-cover__image"
            />
          </figure>
        ) : null}
      </div>

      <div className="tag-row">
        {project.tech.map((tech) => (
          <span key={tech} className="tag tag--detail">{tech}</span>
        ))}
      </div>

      {project.githubUrl && (
        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="external-project-link">
          查看 GitHub 仓库 →
        </a>
      )}

      {markdownContent ? (
        <div className="project-detail-readme article-page--with-toc">
          <MarkdownArticle markdown={markdownContent} />
        </div>
      ) : (
        <div className="detail-copy">
          {project.content}
        </div>
      )}
    </section>
  );
}

function normalizeReadmeMarkdown(markdown: string) {
  return markdown
    .replace(/^# .+\n\n<div align="center">[\s\S]*?<\/div>\n\n---\n\n/, "")
    .replaceAll("./public/", "/");
}

async function readProjectMarkdown(contentPath: string) {
  if (contentPath === "README.md") {
    return readFile(join(process.cwd(), "README.md"), "utf8");
  }

  if (contentPath === "cqupt-src.md") {
    return readFile(join(process.cwd(), "data", "project-docs", "cqupt-src.md"), "utf8");
  }

  if (contentPath === "vulnerability-lab.md") {
    return readFile(join(process.cwd(), "data", "project-docs", "vulnerability-lab.md"), "utf8");
  }

  if (contentPath === "holocubic.md") {
    return readFile(join(process.cwd(), "data", "project-docs", "holocubic.md"), "utf8");
  }

  throw new Error(`Unsupported project markdown source: ${contentPath}`);
}
