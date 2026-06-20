"use client";

import { useState } from "react";
import Link from "next/link";
import LaptopShowcaseWrapper from "@/components/LaptopShowcaseWrapper";

export default function ModelDetailClient({
  model,
  slug,
}: {
  model: {
    name: string;
    description: string;
    tags: string[];
    details: { label: string; value: string }[];
  };
  slug: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="model-detail">
      <Link
        href="/models"
        className="back-link"
        suppressHydrationWarning
      >
        ← 返回模型库
      </Link>

      <div className={`model-detail__layout${collapsed ? " model-detail__layout--collapsed" : ""}`}>
        {/* 模型 */}
        <div className="model-detail__viewer">
          <LaptopShowcaseWrapper />
        </div>

        {/* 把手 */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="model-detail__toggle"
          title={collapsed ? "展开信息" : "收起信息"}
          aria-label={collapsed ? "展开模型信息" : "收起模型信息"}
          aria-expanded={!collapsed}
        >
          <span className="model-detail__toggle-handle" aria-hidden="true" />
        </button>

        {/* 信息面板 */}
        <aside className="model-detail__info">
          <div className="model-detail__info-inner">
            <h1 className="model-detail__title">
              {model.name}
            </h1>
            <p className="model-detail__description" suppressHydrationWarning>
              {model.description}
            </p>

            <div className="model-detail__tags">
              {model.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

            <dl className="model-detail__specs" suppressHydrationWarning>
              {model.details.map((d) => (
                <div key={d.label} className="model-detail__spec">
                  <dt suppressHydrationWarning>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
