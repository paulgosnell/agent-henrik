"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Compass, Users } from "lucide-react";

const STORAGE_BASE = "https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/videos/henrik";

const HERO_CLIPS: { url: string; duration: number }[] = [
  { url: `${STORAGE_BASE}/grok-v2-0.mp4`, duration: 6 },   // Opening: Kraftwerk Berlin
  { url: `${STORAGE_BASE}/grok-v2-1.mp4`, duration: 5 },   // Victoria Peak, Hong Kong
  { url: `${STORAGE_BASE}/grok-v2-2.mp4`, duration: 5 },   // Palace of the Parliament, Bucharest
  { url: `${STORAGE_BASE}/grok-v2-2b.mp4`, duration: 5 },  // Fernsehturm, Berlin
  { url: `${STORAGE_BASE}/grok-v2-3.mp4`, duration: 6 },   // Abisko Northern Lights
  { url: `${STORAGE_BASE}/grok-v2-4.mp4`, duration: 5 },   // Hotel Fasano, Rio de Janeiro
  { url: `${STORAGE_BASE}/grok-v2-5.mp4`, duration: 6 },   // Cox Bay, Vancouver Island
  { url: `${STORAGE_BASE}/grok-v2-6.mp4`, duration: 5 },   // Beirut Arrival
  { url: `${STORAGE_BASE}/grok-v2-7.mp4`, duration: 5 },   // Zuma Mykonos
  { url: `${STORAGE_BASE}/grok-v2-8.mp4`, duration: 6 },   // Reinebringen, Lofoten
  { url: `${STORAGE_BASE}/grok-v2-10.mp4`, duration: 5 },  // Kraftwerk Berlin Nightclub
  { url: `${STORAGE_BASE}/grok-v2-12.mp4`, duration: 5 },  // Burj Khalifa, Dubai
  { url: `${STORAGE_BASE}/grok-v2-13.mp4`, duration: 4 },  // Tom of Finland, Berlin Underground
  { url: `${STORAGE_BASE}/grok-v2-11.mp4`, duration: 5 },  // Closing: Kraftwerk Berlin
];

interface HeroVideoProps {
  headline?: string;
  ctaHref?: string;
}

export function HeroVideo({
  headline = "Your Insider Journey Begins Here",
  ctaHref = "#explore",
}: HeroVideoProps) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activePlayer, setActivePlayer] = useState<"A" | "B">("A");
  const [showText, setShowText] = useState(false);
  const [ended, setEnded] = useState(false);
  const clipIndexRef = useRef(0);

  useEffect(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (!videoA || !videoB) return;

    videoA.src = HERO_CLIPS[0].url;
    videoA.load();
    videoA.play().catch(() => {});

    let advanceTimer: ReturnType<typeof setTimeout>;

    function scheduleAdvance() {
      const clip = HERO_CLIPS[clipIndexRef.current];
      advanceTimer = setTimeout(advance, clip.duration * 1000);
    }

    function advance() {
      const nextIndex = clipIndexRef.current + 1;

      // Last clip finished — fade to black with text
      if (nextIndex >= HERO_CLIPS.length) {
        setEnded(true);
        setShowText(true);
        return;
      }

      clipIndexRef.current = nextIndex;
      const nextClip = HERO_CLIPS[nextIndex];

      setActivePlayer((prev) => {
        if (prev === "A") {
          videoB!.src = nextClip.url;
          videoB!.load();
          videoB!.play().catch(() => {});
          return "B";
        } else {
          videoA!.src = nextClip.url;
          videoA!.load();
          videoA!.play().catch(() => {});
          return "A";
        }
      });

      scheduleAdvance();
    }

    scheduleAdvance();

    return () => {
      clearTimeout(advanceTimer);
    };
  }, []);

  function scrollToNext() {
    const target = document.querySelector(ctaHref);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      <video
        ref={videoARef}
        muted
        playsInline
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          activePlayer === "A" ? "opacity-100" : "opacity-0"
        }`}
      />

      <video
        ref={videoBRef}
        muted
        playsInline
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          activePlayer === "B" ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className={`absolute inset-0 transition-all duration-2000 ${
        ended
          ? "bg-black/60"
          : "bg-gradient-to-b from-black/40 via-black/20 to-black/60"
      }`} />

      <div
        className={`relative z-10 flex h-full flex-col items-center justify-end pb-16 text-center text-white transition-opacity duration-2000 ${
          showText ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="mb-8 max-w-3xl px-6 font-serif text-5xl font-light leading-tight md:text-7xl">
          {headline}
        </h1>

        <div className="mb-8 flex flex-col gap-3 px-6 sm:flex-row sm:gap-4">
          <Link
            href="/explore"
            className="nav-text inline-flex items-center justify-center gap-2 border border-white/60 px-6 py-3 text-white/90 transition-all duration-400 hover:bg-white hover:text-black"
          >
            <MapPin size={14} />
            Explore the Storyworld
          </Link>
          <Link
            href="/experiences"
            className="nav-text inline-flex items-center justify-center gap-2 border border-white/60 px-6 py-3 text-white/90 transition-all duration-400 hover:bg-white hover:text-black"
          >
            <Compass size={14} />
            Find the Experience
          </Link>
          <Link
            href="/storytellers"
            className="nav-text inline-flex items-center justify-center gap-2 border border-white/60 px-6 py-3 text-white/90 transition-all duration-400 hover:bg-white hover:text-black"
          >
            <Users size={14} />
            Meet the Storytellers
          </Link>
        </div>

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
