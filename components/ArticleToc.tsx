"use client";

import { useEffect, useState } from "react";

type Heading = {
  id: string;
  level: 2 | 3;
  text: string;
};

export default function ArticleToc({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 1] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <aside className="article-toc">
      <nav aria-label="文章章节导航">
        <p className="article-toc__title">目录</p>
        <ol>
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`article-toc__item article-toc__item--level-${heading.level}`}
            >
              <a
                href={`#${heading.id}`}
                className={activeId === heading.id ? "article-toc__link--active" : undefined}
                aria-current={activeId === heading.id ? "location" : undefined}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
