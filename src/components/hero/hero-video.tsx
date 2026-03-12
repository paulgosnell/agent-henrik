"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Compass, Users } from "lucide-react";

const STORAGE_BASE = "https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/videos/henrik";
const CHILLEDSITES_BASE = "https://api.chilledsites.com/storage/v1/object/public/videos/cd53f831-1864-47fd-97af-23f2aa3b9feb";

const HERO_CLIPS: { url: string; duration: number }[] = [
  // --- Opening: aerial cityscape montage (3s each) ---
  { url: `${CHILLEDSITES_BASE}/1773236222852-192481d7-299f-433c-a1f5-b0e4984aa85e.mp4`, duration: 3 }, // Hong Kong skyline
  { url: `${CHILLEDSITES_BASE}/1773236296571-298e2e08-8405-42df-8aba-613553771fff.mp4`, duration: 3 }, // Bucharest architecture
  // --- Middle: luxury experience moments (1.5s each) ---
  { url: `${STORAGE_BASE}/champagne-toast.mp4`, duration: 1.5 },
  { url: `${STORAGE_BASE}/rooftop-pool-party.mp4`, duration: 1.5 },
  { url: `${STORAGE_BASE}/nightclub-dancing.mp4`, duration: 1.5 },
  { url: `${STORAGE_BASE}/sushi-chef.mp4`, duration: 1.5 },
  { url: `${STORAGE_BASE}/bartender-mixing.mp4`, duration: 1.5 },
  { url: `${STORAGE_BASE}/candlelit-dinner.mp4`, duration: 1.5 },
  { url: `${STORAGE_BASE}/live-music.mp4`, duration: 1.5 },
  { url: `${STORAGE_BASE}/driving-city-night.mp4`, duration: 1.5 },
  { url: `${STORAGE_BASE}/couple-european-street.mp4`, duration: 1.5 },
  // --- Closing: return to cityscapes (3s each) ---
  { url: `${CHILLEDSITES_BASE}/1773236372012-10978d0e-864d-4b04-9fbe-93928666db41.mp4`, duration: 3 }, // Abisko northern lights
  { url: `${CHILLEDSITES_BASE}/1773236442538-69aa5116-7539-45ee-8c2a-8efcf592990e.mp4`, duration: 3 }, // Rio de Janeiro sunset
];

interface HeroVideoProps {
  posterSrc?: string;
  headline?: string;
  ctaHref?: string;
}

export function HeroVideo({
  posterSrc = "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&q=80",
  headline = "Your Insider Journey Begins Here",
  ctaHref = "#explore",
}: HeroVideoProps) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activePlayer, setActivePlayer] = useState<"A" | "B">("A");
  const [showText, setShowText] = useState(false);
  const clipIndexRef = useRef(0);

  useEffect(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (!videoA || !videoB) return;

    videoA.src = HERO_CLIPS[0].url;
    videoA.load();
    videoA.play().catch(() => {});

    const textTimer = setTimeout(() => setShowText(true), 4000);

    let advanceTimer: ReturnType<typeof setTimeout>;

    function scheduleAdvance() {
      const clip = HERO_CLIPS[clipIndexRef.current];
      advanceTimer = setTimeout(advance, clip.duration * 1000);
    }

    function advance() {
      clipIndexRef.current = (clipIndexRef.current + 1) % HERO_CLIPS.length;
      const nextClip = HERO_CLIPS[clipIndexRef.current];

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
      clearTimeout(textTimer);
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
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${posterSrc})` }}
      />

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

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      <div
        className={`relative z-10 flex h-full flex-col items-center justify-end pb-16 text-center text-white transition-opacity duration-1000 ${
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
