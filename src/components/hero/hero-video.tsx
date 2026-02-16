"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface HeroVideoProps {
  videoSrc?: string;
  posterSrc?: string;
  headline?: string;
  ctaText?: string;
  ctaHref?: string;
  textAppearAt?: number;
}

export function HeroVideo({
  videoSrc = "https://api.chilledsites.com/storage/v1/object/public/p0stman/agent-henrik_video_3.mp4",
  posterSrc = "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&q=80",
  headline = "Your Insider Journey Begins Here",
  ctaText = "Start Exploring",
  ctaHref = "#experiences",
  textAppearAt = 7,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function handleTimeUpdate() {
      if (video!.currentTime >= textAppearAt && !showText) {
        setShowText(true);
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [textAppearAt, showText]);

  function scrollToNext() {
    const target = document.querySelector(ctaHref);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Poster Image Fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${posterSrc})` }}
      />

      {/* Video Background (plays once, no loop) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        poster={posterSrc}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Content — hidden until textAppearAt seconds into video */}
      <div
        className={`relative z-10 flex h-full flex-col items-center justify-end pb-24 text-center text-white transition-opacity duration-1000 ${
          showText ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="mb-6 max-w-3xl px-6 font-serif text-5xl font-light leading-tight md:text-7xl">
          {headline}
        </h1>

        <button
          onClick={scrollToNext}
          className="nav-text mb-8 cursor-pointer border border-white/60 px-8 py-3 text-white/90 transition-all duration-400 hover:bg-white hover:text-black"
        >
          {ctaText}
        </button>

        {/* Scroll indicator */}
        <button
          onClick={scrollToNext}
          className="animate-bounce-subtle cursor-pointer text-white/60 transition-opacity hover:text-white"
          aria-label="Scroll down"
        >
          <ChevronDown size={28} />
        </button>
      </div>
    </section>
  );
}
