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
    <h1 className="typewriter-title">
      {text}
      <span className="typewriter-cursor">|</span>
    </h1>
  );
}
