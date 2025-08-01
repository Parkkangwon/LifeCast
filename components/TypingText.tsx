import { useState, useEffect } from "react";

interface TypingTextProps {
  text: string;
  speed?: number; // ms per character
  lineDelay?: number; // ms between lines
}

export default function TypingText({ text, speed = 40, lineDelay = 500 }: TypingTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const chars = text.split("");

  useEffect(() => {
    setVisibleCount(0);
    if (!text) return;
    let isCancelled = false;
    let i = 0;
    function showNext() {
      if (isCancelled) return;
      setVisibleCount((prev) => {
        if (prev < chars.length) {
          setTimeout(showNext, chars[prev] === "\n" ? lineDelay : speed);
        }
        return prev + 1;
      });
    }
    setTimeout(showNext, speed);
    return () => { isCancelled = true; };
    // eslint-disable-next-line
  }, [text, speed, lineDelay]);

  return (
    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {chars.map((char, idx) => (
        <span
          key={idx}
          className={
            idx < visibleCount
              ? "typing-char typing-char-appear"
              : "typing-char"
          }
          style={{
            display: char === "\n" ? "block" : "inline-block",
            transition: "none"
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
      <style>{`
        .typing-char {
          opacity: 0;
          transform: scale(0.8);
          transition: none;
        }
        .typing-char-appear {
          animation: typingCharAppear 0.5s cubic-bezier(.4,2,.6,1) forwards;
        }
        @keyframes typingCharAppear {
          0% {
            opacity: 0;
            transform: scale(1.8);
          }
          60% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </pre>
  );
} 