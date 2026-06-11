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
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link
        href="/models"
        style={{ color: "var(--muted)", fontSize: "0.9rem", display: "inline-block", marginBottom: "1.5rem" }}
      >
        ← 返回模型库
      </Link>

      <div style={{ display: "flex" }}>
        {/* 模型 */}
        <div style={{ flex: collapsed ? "1 1 100%" : "0 0 70%", minWidth: 0, transition: "flex 0.35s ease" }}>
          <LaptopShowcaseWrapper />
        </div>

        {/* 把手 */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          title={collapsed ? "展开信息" : "收起信息"}
        >
          <div
            style={{
              width: "3px",
              height: "48px",
              borderRadius: "2px",
              background: "var(--muted)",
              opacity: 0.3,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.3")}
          />
        </div>

        {/* 信息面板 */}
        <div
          style={{
            flex: collapsed ? "0 0 0px" : "0 1 30%",
            overflow: "hidden",
            opacity: collapsed ? 0 : 1,
            maxHeight: collapsed ? "0px" : "none",
            transition: "flex 0.35s ease, opacity 0.25s ease, max-height 0s 0.35s",
          }}
        >
          <div style={{ paddingLeft: "0.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              {model.name}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.65 }}>
              {model.description}
            </p>

            <div style={{ display: "flex", gap: "0.4rem", marginTop: "1rem", flexWrap: "wrap" }}>
              {model.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

            <dl style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
              {model.details.map((d) => (
                <div
                  key={d.label}
                  style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.85rem" }}
                >
                  <dt style={{ color: "var(--muted)" }}>{d.label}</dt>
                  <dd style={{ fontWeight: 500 }}>{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
