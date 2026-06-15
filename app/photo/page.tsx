import type { Metadata } from "next";
import PhotoRegionWall from "@/components/photo/PhotoRegionWall";
import { photoRegions } from "@/data/photoRegions";

export const metadata: Metadata = {
  title: "摄影 — Zonora",
  description: "按地区分类的摄影冰箱贴墙，可循环切换省份、拖拽照片并点击查看大图。",
};

export default function PhotoPage() {
  return <PhotoRegionWall regions={photoRegions} />;
}
