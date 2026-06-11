"use client";

import { useState, useEffect, useCallback } from "react";

const FULL_TEXT = "你好，我是 Zonora";

export default function TypewriterTitle() {
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const animate = useCallback(() => {
    if (!deleting) {
      if (text.length < FULL_TEXT.length) {
        const timer = setTimeout(() => setText(FULL_TEXT.slice(0, text.length + 1)), 150);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setDeleting(true), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      if (text.length > 0) {
        const timer = setTimeout(() => setText(FULL_TEXT.slice(0, text.length - 1)), 80);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setDeleting(false), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [text, deleting]);

  useEffect(() => {
    const cleanup = animate();
    return cleanup;
  }, [animate]);

  return (
    <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--fg)", marginBottom: "0.3em" }}>
      {text}
      <span style={{
        opacity: 0.4,
        fontWeight: 300,
        animation: "blink 1s step-end infinite",
      }}>|</span>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </h1>
  );
}
