import type { Metadata } from "next";
import ArtGallery from "@/components/ArtGallery";
import { artSketches } from "@/data/artSketches";

export const metadata: Metadata = {
  title: "绘画 — Zonora",
  description: "216 张速写与绘画练习组成的横向美术馆展墙。",
};

export default function ArtPage() {
  return (
    <section className="page-section art-page">
      <div className="art-page__intro">
        <p className="art-page__eyebrow">Sketch archive</p>
        <h1 className="page-title page-title--spacious">绘画</h1>
        <p className="page-lead art-page__lead">
          216 张速写与绘画练习，按真实比例悬挂在一面横向展开的黑白展墙上。
        </p>
      </div>

      <ArtGallery sketches={artSketches} />
    </section>
  );
}
