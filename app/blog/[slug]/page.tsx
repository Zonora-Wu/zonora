import { notFound } from "next/navigation";
import Link from "next/link";

const posts: Record<
  string,
  { title: string; date: string; content: string }
> = {
  "hello-world": {
    title: "你好，世界",
    date: "2026-06-01",
    content: `欢迎来到 **Zonora**，这是我的个人博客。

这里将记录我的技术探索、项目复盘，以及一些关于三维图形编程的心得。

## 技术栈

- **框架**: Next.js 16 — 静态生成，SEO 友好
- **3D 渲染**: Three.js + React Three Fiber — 声明式 3D 场景
- **样式**: 纯 CSS — 轻量无依赖

## 为什么叫 Zonora？

Zonora 是 "Zone" 和 "Aurora" 的结合——寓意一个充满极光般绚丽想象的私人空间。

感谢你的到访，敬请期待更多内容。`,
  },
  "threejs-journey": {
    title: "Three.js 学习笔记：从入门到第一个场景",
    date: "2026-06-03",
    content: `记录我学习 Three.js 的过程，以及在 React 中优雅使用 3D 渲染的实践。

## 为什么选择 React Three Fiber？

过去在 React 中使用 Three.js 是一件比较痛苦的事情——你需要手动管理 canvas、scene、renderer，还要处理 React 生命周期和 Three.js 对象的同步。

**React Three Fiber (R3F)** 解决了这些问题：

- 用声明式 JSX 描述 3D 场景
- 自动处理 mount/unmount
- 完美融入 React 生态（状态管理、事件处理）
- \`@react-three/drei\` 提供了大量开箱即用的工具

## 一个简单的场景

\`\`\`tsx
<Canvas>
  <ambientLight intensity={0.5} />
  <spotLight position={[10, 10, 10]} />
  <mesh>
    <boxGeometry />
    <meshStandardMaterial color="hotpink" />
  </mesh>
</Canvas>
\`\`\`

这就是在 React 中创建一个旋转立方体所需的全部代码。

## 下一步

接下来我计划探索：

1. 模型加载（GLTF/GLB）
2. 交互式动画
3. 后期处理效果
4. 性能优化技巧

Stay tuned!`,
  },
};

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    notFound();
  }

  return (
    <article className="page-section article-page">
      <Link href="/blog" className="back-link">
        ← 返回博客
      </Link>
      <time className="article-date">
        {post.date}
      </time>
      <h1 className="article-title">
        {post.title}
      </h1>
      <div
        className="prose article-prose"
        dangerouslySetInnerHTML={{
          __html: post.content
            .replace(/^### (.+)$/gm, "<h3>$1</h3>")
            .replace(/^## (.+)$/gm, "<h2>$1</h2>")
            .replace(/^# (.+)$/gm, "<h1>$1</h1>")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/^- (.+)$/gm, "<li>$1</li>")
            .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
            .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
            .replace(/`(.+?)`/g, "<code>$1</code>")
            .replace(/\n\n/g, "</p><p>")
            .replace(/^(.+)$/gm, (line) =>
              line.startsWith("<") ? line : `<p>${line}</p>`
            ),
        }}
      />
    </article>
  );
}
