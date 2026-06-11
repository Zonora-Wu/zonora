import { notFound } from "next/navigation";
import ModelDetailClient from "@/components/ModelDetailClient";

const models: Record<
  string,
  {
    name: string;
    description: string;
    tags: string[];
    details: { label: string; value: string }[];
  }
> = {
  "rog-zephyrus-g14": {
    name: "ROG 幻14 笔记本电脑",
    description: "ASUS ROG Zephyrus G14 (2022) — 去镭射孔定制版本。精细的 3D 扫描模型，展示了笔记本电脑的外观细节。拖拽旋转视角，点击屏幕区域翻开/合上屏幕，滚轮缩放。",
    tags: ["硬表面", "电子产品", "GLB"],
    details: [
      { label: "模型格式", value: "GLB (Binary glTF)" },
      { label: "分类", value: "硬表面 / 电子产品" },
      { label: "交互", value: "拖拽旋转 · 滚轮缩放 · 点击开合" },
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
  if (!model) notFound();
  return <ModelDetailClient model={model} slug={slug} />;
}
