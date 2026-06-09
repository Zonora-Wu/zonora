import Link from "next/link";
import Scene3DWrapper from "@/components/Scene3DWrapper";

const posts = [
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

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>你好，我是 Zonora 👋</h1>
        <p>
          这里记录我的思考、创造与探索。偶尔写写代码，也喜欢用三维图形表达想法。
        </p>
      </section>

      <div className="canvas-container">
        <Scene3DWrapper />
      </div>

      <section className="posts">
        <h2>最新文章</h2>
        <ul className="post-list">
          {posts.map((post) => (
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
    </>
  );
}
