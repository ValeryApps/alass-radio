"use client";

import { useEffect, useState } from "react";

export default function HeadlineTicker({ headlines }: { headlines: string[] }) {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "waiting" | "erasing">(
    "typing",
  );

  useEffect(() => {
    if (headlines?.length === 0) return;

    const currentHeadline = headlines[headlineIndex];

    if (!currentHeadline) return;

    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (typedText.length < currentHeadline.length) {
        timeout = setTimeout(() => {
          setTypedText(currentHeadline.slice(0, typedText.length + 1));
        }, 45);
      } else {
        setPhase("waiting");
      }
    }

    if (phase === "waiting") {
      timeout = setTimeout(() => {
        setPhase("erasing");
      }, 3000);
    }

    if (phase === "erasing") {
      if (typedText.length > 0) {
        timeout = setTimeout(() => {
          setTypedText((previous) => previous.slice(0, -1));
        }, 25);
      } else {
        setHeadlineIndex((previous) => (previous + 1) % headlines.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [headlines, headlineIndex, typedText, phase]);

  return (
    <div className="overflow-hidden flex-1 flex items-center">
      <div className="px-3 sm:px-8 text-xs sm:text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
        {typedText}
        <span className="inline-block  ml-1 text-yellow-100 animate-pulse md:text-2xl">
          |
        </span>
      </div>
    </div>
  );
}
