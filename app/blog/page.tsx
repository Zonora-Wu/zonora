import Link from "next/link";

const allPosts = [
  {
    slug: "rtx5070-local-llm-claude-code-hermes-agent",
    title: "RTX 5070 12GB 本地跑大模型实测：接入 Claude Code 与 Hermes Agent",
    date: "2026-06-21",
    excerpt: "实测 llama.exe、Ollama、LM Studio，并接入 Claude Code 与 Hermes Agent 的本地大模型工作流。",
  },
  {
    slug: "hello-world",
    title: "你好，世界",
    date: "2026-06-01",
    excerpt: "欢迎来到 Zonora，这是我用 Next.js 和 Three.js 搭建的个人博客。",
  },
  {
    slug: "threejs-journey",
    title: "Three.js 学习笔记：从入门到第一个场景",
    date: "2026-06-03",
    excerpt: "记录我学习 Three.js 的过程，以及如何在 React 中优雅地使用 3D 渲染。",
  },
];

export default function BlogPage() {
  return (
    <section className="page-section">
      <h1 className="page-title">
        博客
      </h1>
      <p className="page-count">
        共 {allPosts.length} 篇文章
      </p>
      <ul className="post-list">
        {allPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="post-card">
              <time>{post.date}</time>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
