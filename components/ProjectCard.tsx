"use client";

import { useRef } from "react";
import Link from "next/link";

export default function ProjectCard({
  slug,
  name,
  description,
  detail,
  tags,
  image,
  icon = "🔐",
}: {
  slug: string;
  name: string;
  description: string;
  detail: string;
  tags: string[];
  image?: string;
  icon?: string;
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
      href={`/projects/${slug}`}
      className="project-card-link"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <article className="model-card project-card">
        <div className="model-card-thumb">
          {image ? (
            <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{
              width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
            }}>
              <span style={{ fontSize: "2.5rem", opacity: 0.3 }}>{icon}</span>
            </div>
          )}
          <div className="model-card-badge">{tags[0]}</div>
        </div>
        <div className="model-card-body">
          <h3>{name}</h3>
          <p>{description}</p>
          <div className="model-card-tags">
            {tags.slice(1).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
