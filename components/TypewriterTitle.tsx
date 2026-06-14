"use client";

import { useEffect, useState } from "react";

const COPY = [
  {
    title: "你好，我是 Zonora",
    subtitle: "探索未知 · 记录创造",
  },
  {
    title: "Hello, I'm Zonora",
    subtitle: "Explore the unknown · Chronicle creation",
  },
  {
    title: "こんにちは、私は Zonora です",
    subtitle: "未知を探索 · 創造を記録",
  },
];

type TypewriterPhase =
  | "titleTyping"
  | "subtitleTyping"
  | "holding"
  | "subtitleDeleting"
  | "titleDeleting";

export default function TypewriterTitle() {
  const [copyIndex, setCopyIndex] = useState(0);
  const [titleText, setTitleText] = useState("");
  const [subtitleText, setSubtitleText] = useState("");
  const [phase, setPhase] = useState<TypewriterPhase>("titleTyping");
  const copy = COPY[copyIndex];

  useEffect(() => {
    if (phase === "titleTyping") {
      if (titleText.length < copy.title.length) {
        const timer = window.setTimeout(
          () => setTitleText(copy.title.slice(0, titleText.length + 1)),
          150
        );
        return () => window.clearTimeout(timer);
      }

      const timer = window.setTimeout(() => setPhase("subtitleTyping"), 900);
      return () => window.clearTimeout(timer);
    }

    if (phase === "subtitleTyping") {
      if (subtitleText.length < copy.subtitle.length) {
        const timer = window.setTimeout(
          () => setSubtitleText(copy.subtitle.slice(0, subtitleText.length + 1)),
          95
        );
        return () => window.clearTimeout(timer);
      }

      const timer = window.setTimeout(() => setPhase("holding"), 3000);
      return () => window.clearTimeout(timer);
    }

    if (phase === "holding") {
      const timer = window.setTimeout(() => setPhase("subtitleDeleting"), 200);
      return () => window.clearTimeout(timer);
    }

    if (phase === "subtitleDeleting") {
      if (subtitleText.length > 0) {
        const timer = window.setTimeout(
          () => setSubtitleText(copy.subtitle.slice(0, subtitleText.length - 1)),
          45
        );
        return () => window.clearTimeout(timer);
      }

      const timer = window.setTimeout(() => setPhase("titleDeleting"), 220);
      return () => window.clearTimeout(timer);
    }

    if (titleText.length > 0) {
      const timer = window.setTimeout(
        () => setTitleText(copy.title.slice(0, titleText.length - 1)),
        70
      );
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setCopyIndex((current) => (current + 1) % COPY.length);
      setPhase("titleTyping");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [copy, phase, subtitleText, titleText]);

  const titleCursorActive =
    (phase === "titleTyping" && titleText.length < copy.title.length) ||
    (phase === "titleDeleting" && titleText.length > 0);
  const subtitleCursorActive =
    (phase === "subtitleTyping" && subtitleText.length < copy.subtitle.length) ||
    (phase === "subtitleDeleting" && subtitleText.length > 0);

  return (
    <>
      <h1 className="typewriter-title">
        {titleText}
        <span
          className="typewriter-cursor"
          style={{ opacity: titleCursorActive ? undefined : 0, animation: titleCursorActive ? undefined : "none" }}
          aria-hidden="true"
        >
          |
        </span>
      </h1>
      <p className="home-subtitle">
        {subtitleText}
        <span
          className="typewriter-cursor"
          style={{ opacity: subtitleCursorActive ? undefined : 0, animation: subtitleCursorActive ? undefined : "none" }}
          aria-hidden="true"
        >
          |
        </span>
      </p>
    </>
  );
}
