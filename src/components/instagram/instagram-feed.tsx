"use client";

import { useEffect, useRef } from "react";

interface InstagramFeedProps {
  username: string;
  limit?: number;
}

export function InstagramFeed({ username, limit = 6 }: InstagramFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function load() {
      // Clear previous content
      container!.innerHTML = "";

      // Detect theme from data-theme attribute (site uses this, not prefers-color-scheme)
      const theme = document.documentElement.getAttribute("data-theme");
      const isDark = theme !== "light";

      const script = document.createElement("script");
      script.src = `https://stormlikes.com/js/embed.min.js?key=${username}&limit=${limit}&dark=${isDark}&types=true`;
      script.crossOrigin = "anonymous";
      script.async = true;
      container!.appendChild(script);
    }

    load();

    // Reload on theme change
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "data-theme") {
          load();
          break;
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
      if (container) container.innerHTML = "";
    };
  }, [username, limit]);

  return <div ref={containerRef} className="instagram-feed mx-auto max-w-4xl" />;
}
