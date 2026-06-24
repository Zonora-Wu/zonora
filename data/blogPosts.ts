import { readFileSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
};

const BLOG_DIRECTORY = join(process.cwd(), "data/blog");
const REQUIRED_FIELDS = ["title", "date", "excerpt"] as const;

function parseBlogFile(file: string): BlogPost {
  const source = readFileSync(join(BLOG_DIRECTORY, file), "utf8").replace(/\r\n/g, "\n");
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n*/);

  if (!frontmatter) {
    throw new Error(`博客文章 ${file} 缺少 YAML frontmatter。`);
  }

  const metadata = new Map<string, string>();

  frontmatter[1].split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator === -1) return;

    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, "$2");

    metadata.set(key, value);
  });

  REQUIRED_FIELDS.forEach((field) => {
    if (!metadata.get(field)) {
      throw new Error(`博客文章 ${file} 缺少 frontmatter 字段：${field}。`);
    }
  });

  return {
    slug: basename(file, extname(file)),
    title: metadata.get("title")!,
    date: metadata.get("date")!,
    excerpt: metadata.get("excerpt")!,
    content: source.slice(frontmatter[0].length),
  };
}

export const blogPosts = readdirSync(BLOG_DIRECTORY)
  .filter((file) => extname(file) === ".md")
  .map(parseBlogFile)
  .sort((a, b) => b.date.localeCompare(a.date));

const postsBySlug = new Map(blogPosts.map((post) => [post.slug, post]));

export function getBlogPost(slug: string) {
  return postsBySlug.get(slug);
}
