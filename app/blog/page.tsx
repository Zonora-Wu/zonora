import Link from "next/link";
import { blogPosts } from "@/data/blogPosts";

export default function BlogPage() {
  return (
    <section className="page-section">
      <h1 className="page-title">
        博客
      </h1>
      <p className="page-count">
        共 {blogPosts.length} 篇文章
      </p>
      <ul className="post-list">
        {blogPosts.map((post) => (
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
