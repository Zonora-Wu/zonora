import ModelCard from "@/components/ModelCard";

const models = [
  {
    slug: "rog-zephyrus-g14",
    name: "ROG 幻14 笔记本电脑",
    description: "ASUS ROG Zephyrus G14 — 去镭射孔定制版本",
    detail: "精细 3D 扫描模型 · 拖拽旋转 · 滚轮缩放 · 点击开合屏幕 · 支持亮色/暗色双主题",
    modelPath: "/models/rog14-thumb.png",
    tags: ["硬表面", "电子产品", "GLB"],
  },
];

export default function ModelsPage() {
  return (
    <section className="page-section">
      <h1 className="page-title">模型</h1>
      <p className="page-lead">
        Three.js 3D 模型展示库 — 悬停卡片查看详情，点击进入交互式浏览。
      </p>

      <div className="card-grid">
        {models.map((model) => (
          <ModelCard key={model.slug} {...model} />
        ))}
      </div>
    </section>
  );
}
