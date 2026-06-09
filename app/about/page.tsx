export default function AboutPage() {
  return (
    <section style={{ padding: "3rem 0 4rem", maxWidth: "640px" }}>
      <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "1.5rem" }}>
        关于
      </h1>
      <div style={{ color: "#d4d4d4", lineHeight: 1.8 }}>
        <p style={{ marginBottom: "1rem" }}>
          Zonora 是我的个人数字花园 🌱——一个用来记录技术探索、项目复盘和创意实验的空间。
        </p>
        <p style={{ marginBottom: "1rem" }}>
          我对前端工程、三维图形编程和交互设计充满热情。Three.js
          让我着迷，因为它把数学和美学融合在一起，在浏览器里创造出令人惊叹的视觉体验。
        </p>
        <p style={{ marginBottom: "1rem" }}>
          这个博客本身就是一个持续迭代的项目——用 Next.js 构建，用 React Three
          Fiber 探索 3D 的可能性，用文字记录成长的轨迹。
        </p>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "2rem 0 0.75rem" }}>
          联系方式
        </h2>
        <ul style={{ paddingLeft: "1.25rem", color: "var(--muted)" }}>
          <li>GitHub: github.com/zonora</li>
          <li>Email: hi@zonora.dev</li>
        </ul>
      </div>
    </section>
  );
}
