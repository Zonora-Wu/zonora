import { notFound } from "next/navigation";
import Link from "next/link";
import ModelViewerWrapper from "@/components/ModelViewerWrapper";

const models: Record<
  string,
  {
    name: string;
    description: string;
    modelPath: string;
    tags: string[];
    details: { label: string; value: string }[];
  }
> = {
  "rog-zephyrus-g14": {
    name: "ROG 幻14 笔记本电脑",
    description:
      "ASUS ROG Zephyrus G14 (2022) — 去镭射孔定制版本。精细的 3D 扫描模型，展示了笔记本电脑的外观细节。可通过鼠标拖拽旋转视角、滚轮缩放、右键平移来从任意角度观察模型。",
    modelPath: "/models/laptop.glb",
    tags: ["硬表面", "电子产品", "GLB"],
    details: [
      { label: "模型格式", value: "GLB (Binary glTF)" },
      { label: "分类", value: "硬表面 / 电子产品" },
      { label: "交互", value: "拖拽旋转 · 滚轮缩放 · 右键平移" },
    ],
  },
};

export default async function ModelDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = models[slug];

  if (!model) {
    notFound();
  }

  return (
    <section style={{ padding: "2rem 0 4rem" }}>
      {/* 面包屑导航 */}
      <Link
        href="/models"
        style={{
          color: "var(--muted)",
          fontSize: "0.9rem",
          display: "inline-block",
          marginBottom: "1.5rem",
        }}
      >
        ← 返回模型库
      </Link>

      {/* 3D 查看器 */}
      <ModelViewerWrapper modelPath={model.modelPath} height="70vh" />

      {/* 模型信息 */}
      <div style={{ marginTop: "2rem", maxWidth: "720px" }}>
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: "0.75rem",
          }}
        >
          {model.name}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.7 }}>
          {model.description}
        </p>

        {/* 标签 */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
          {model.tags.map((tag) => (
            <span key={tag} className="tag" style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* 详细信息表 */}
        <dl
          style={{
            marginTop: "2.5rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "1.5rem",
          }}
        >
          {model.details.map((d) => (
            <div
              key={d.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.6rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontSize: "0.9rem",
              }}
            >
              <dt style={{ color: "var(--muted)" }}>{d.label}</dt>
              <dd style={{ color: "var(--fg)", fontWeight: 500 }}>{d.value}</dd>
            </div>
          ))}
        </dl>

        {/* 操作提示 */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem 1.25rem",
            background: "rgba(99, 102, 241, 0.06)",
            border: "1px solid rgba(99, 102, 241, 0.15)",
            borderRadius: "var(--radius)",
            fontSize: "0.85rem",
            color: "var(--muted)",
            lineHeight: 1.8,
          }}
        >
          <strong style={{ color: "#a5b4fc" }}>🖱 操作提示</strong>
          <br />
          拖拽左键 → 旋转 · 滚轮 → 缩放 · 拖拽右键 → 平移
        </div>
      </div>
    </section>
  );
}
