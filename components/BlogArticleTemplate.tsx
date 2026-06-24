import MarkdownArticle from "@/components/MarkdownArticle";
import type { BlogPost } from "@/data/blogPosts";

export default function BlogArticleTemplate({ post }: { post: BlogPost }) {
  return (
    <article className="page-section article-page article-page--with-toc">
      <MarkdownArticle
        markdown={post.content}
        header={
          <header className="article-header">
            <h1 className="article-title">{post.title}</h1>
          </header>
        }
      />
    </article>
  );
}
