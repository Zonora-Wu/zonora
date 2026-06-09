import Link from "next/link";

const models = [
  {
    slug: "rog-zephyrus-g14",
    name: "ROG 幻14 笔记本电脑",
    description: "ASUS ROG Zephyrus G14 — 去镭射孔定制版本，精细的 3D 扫描模型。",
    thumbnail: null,
    tags: ["硬表面", "电子产品", "GLB"],
  },
];

export default function ModelsPage() {
  return (
    <section style={{ padding: "3rem 0 4rem" }}>
      <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>
        模型
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "1.05rem", marginBottom: "2.5rem" }}>
        Three.js 3D 模型展示库 — 点击卡片进入交互式浏览。
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {models.map((model) => (
          <Link
            key={model.slug}
            href={`/models/${model.slug}`}
            style={{ textDecoration: "none" }}
          >
            <article className="model-card">
              {/* 缩略图占位 */}
              <div className="model-card-thumb">
                <div className="model-card-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.4 }}
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="model-card-badge">3D</div>
              </div>

              {/* 信息 */}
              <div className="model-card-body">
                <h3>{model.name}</h3>
                <p>{model.description}</p>
                <div className="model-card-tags">
                  {model.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
