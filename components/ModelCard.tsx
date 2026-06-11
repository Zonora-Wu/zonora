"use client";

import { useRef } from "react";
import Link from "next/link";

export default function ModelCard({
  slug,
  name,
  description,
  detail,
  tags,
  modelPath,
}: {
  slug: string;
  name: string;
  description: string;
  detail: string;
  tags: string[];
  modelPath: string;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.03)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  };

  return (
    <Link
      ref={cardRef}
      href={`/models/${slug}`}
      style={{
        textDecoration: "none",
        transition: "transform 0.3s ease-out",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <article className="model-card">
        <div className="model-card-thumb">
          <img
            src={modelPath}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }}
          />
          <div className="model-card-badge">3D</div>
        </div>
        <div className="model-card-body">
          <h3>{name}</h3>
          <p>{description}</p>
          <div className="model-card-tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
