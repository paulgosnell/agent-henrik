"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Compass, Users, Volume2, VolumeX } from "lucide-react";

const V2_BASE = "https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/videos/henrik";
const V3_BASE = "https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/videos/hero-v3";
const V4_BASE = "https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/videos/hero-v4";

const HERO_CLIPS: { url: string; duration: number }[] = [
  { url: `${V4_BASE}/clip-00-factory-opening.mp4`, duration: 6 },     // Opening: Kraftwerk Berlin (v4 Veo, embedded voice)
  { url: `${V4_BASE}/clip-01-hong-kong.mp4`, duration: 6 },           // Victoria Peak, Hong Kong (real Pexels footage per Henrik)
  { url: `${V4_BASE}/rio-real.mp4`, duration: 5 },                    // Rio de Janeiro — real footage (replaces generic AI skyline, Henrik 25 Jun)
  { url: `${V3_BASE}/clip-02-bucharest.mp4`, duration: 6 },           // Palace of Parliament, Bucharest (v3)
  { url: `${V4_BASE}/clip-2b-berlin-tv-tower.mp4`, duration: 6 },     // Fernsehturm, Berlin (v4 Veo, clock removed)
  { url: `${V2_BASE}/grok-v2-3.mp4`, duration: 6 },                   // Abisko Northern Lights (KEEP v2)
  { url: `${V4_BASE}/sao-paulo-real.mp4`, duration: 5 },              // São Paulo — real footage (replaces AI Hotel Fasano Rio, Henrik 25 Jun)
  { url: `${V4_BASE}/clip-05-cox-bay.mp4`, duration: 6 },             // Cox Bay, Vancouver Island (v4 Veo, bowtie removed)
  { url: `${V3_BASE}/clip-06-beirut.mp4`, duration: 6 },              // Beirut Airplane Arrival (v3)
  { url: `${V3_BASE}/clip-07-mykonos-woman.mp4`, duration: 6 },       // Mykonos Woman at Pool (v3)
  { url: `${V4_BASE}/lofoten-real.mp4`, duration: 5 },               // Reinebringen, Lofoten — real drone footage (replaces AI clip, Henrik 25 Jun)
  { url: `${V3_BASE}/clip-12-dubai.mp4`, duration: 6 },               // Burj Khalifa, Dubai (v3)
  { url: `${V3_BASE}/insert-c-rooftop-bar.mp4`, duration: 6 },        // Rooftop Bar insert (v3)
  { url: `${V4_BASE}/clip-10-berlin-club-closing-notrun.mp4`, duration: 5.5 }, // CLOSING: Berlin Club — trimmed before turn-around, fast fade (Henrik 25 Jun)
];

const MUSIC_SRC = "/audio/hero-music.mp3";
const MUSIC_DROP_IN = 7.5;  // hard beats start here in the Pixabay track
const VOICE_END = 5;        // "...there is something I need to show you" ends ~5s into clip 0
const MUSIC_VOL = 0.9;
const DUCK_VOL = 0.15;
const SOUND_PREF_KEY = "ah-hero-sound";

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activePlayer, setActivePlayer] = useState<"A" | "B">("A");
  const [showText, setShowText] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);
  const clipIndexRef = useRef(0);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const musicStartedRef = useRef(false);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function fadeMusicTo(target: number, ms = 800) {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    const start = audio.volume;
    const steps = Math.max(1, Math.round(ms / 50));
    let step = 0;
    fadeTimerRef.current = setInterval(() => {
      step += 1;
      audio.volume = Math.min(1, Math.max(0, start + (target - start) * (step / steps)));
      if (step >= steps && fadeTimerRef.current) {
        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    }, 50);
  }

  function startMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!musicStartedRef.current) {
      audio.currentTime = MUSIC_DROP_IN;
      musicStartedRef.current = true;
    }
    audio.volume = 0;
    audio
      .play()
      .then(() => fadeMusicTo(MUSIC_VOL))
      .catch(() => {
        // Autoplay blocked (no user gesture yet) — stay silent until the toggle is clicked
        musicStartedRef.current = false;
        soundOnRef.current = false;
        setSoundOn(false);
      });
  }

  useEffect(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (!videoA || !videoB) return;

    // Restore sound preference from a previous visit (browser may still block until a gesture)
    const restored = localStorage.getItem(SOUND_PREF_KEY) === "on";
    soundOnRef.current = restored;
    setSoundOn(restored);

    activeVideoRef.current = videoA;
    videoA.src = HERO_CLIPS[0].url;
    videoA.muted = !restored;
    videoA.load();
    videoA.play().catch(() => {
      if (!videoA.muted) {
        // Autoplay with sound blocked — fall back to muted playback
        videoA.muted = true;
        soundOnRef.current = false;
        setSoundOn(false);
        videoA.play().catch(() => {});
      }
    });

    let advanceTimer: ReturnType<typeof setTimeout>;
    let voiceEndTimer: ReturnType<typeof setTimeout>;

    // Music enters when the opening phrase ends; on later loops the duck lifts here too
    function scheduleVoiceEnd() {
      voiceEndTimer = setTimeout(() => {
        if (!soundOnRef.current) return;
        if (musicStartedRef.current) {
          fadeMusicTo(MUSIC_VOL);
        } else {
          startMusic();
        }
      }, VOICE_END * 1000);
    }

    function scheduleAdvance() {
      const clip = HERO_CLIPS[clipIndexRef.current];
      advanceTimer = setTimeout(advance, clip.duration * 1000);
    }

    function advance() {
      let nextIndex = clipIndexRef.current + 1;

      // Montage loops continuously; overlay appears after the first full pass
      if (nextIndex >= HERO_CLIPS.length) {
        nextIndex = 0;
        setShowText(true);
      }

      clipIndexRef.current = nextIndex;
      const nextClip = HERO_CLIPS[nextIndex];
      // Only clip 0 carries wanted audio (the embedded voice line)
      const wantVoice = nextIndex === 0 && soundOnRef.current;

      setActivePlayer((prev) => {
        const incoming = prev === "A" ? videoB! : videoA!;
        incoming.src = nextClip.url;
        incoming.muted = !wantVoice;
        incoming.load();
        incoming.play().catch(() => {});
        activeVideoRef.current = incoming;
        return prev === "A" ? "B" : "A";
      });

      if (nextIndex === 0) {
        if (wantVoice && musicStartedRef.current) fadeMusicTo(DUCK_VOL, 400);
        scheduleVoiceEnd();
      }

      scheduleAdvance();
    }

    scheduleVoiceEnd();
    scheduleAdvance();

    return () => {
      clearTimeout(advanceTimer);
      clearTimeout(voiceEndTimer);
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      audioRef.current?.pause();
    };
  }, []);

  function toggleSound() {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    localStorage.setItem(SOUND_PREF_KEY, next ? "on" : "off");

    const active = activeVideoRef.current;
    if (next) {
      // Voice only lives on clip 0; everywhere else the music carries the sound
      if (clipIndexRef.current === 0 && active) active.muted = false;
      if (clipIndexRef.current !== 0 || (active && active.currentTime >= VOICE_END)) {
        startMusic();
      }
    } else {
      if (active) active.muted = true;
      audioRef.current?.pause();
    }
  }

  function scrollToNext() {
    const target = document.querySelector(ctaHref);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section id="hero" className="hero-viewport relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      <video
        ref={videoARef}
        muted
        playsInline
        className={`absolute inset-0 h-full w-full object-cover object-[center_25%] sm:object-center transition-opacity duration-1000 ${
          activePlayer === "A" ? "opacity-100" : "opacity-0"
        }`}
      />

      <video
        ref={videoBRef}
        muted
        playsInline
        className={`absolute inset-0 h-full w-full object-cover object-[center_25%] sm:object-center transition-opacity duration-1000 ${
          activePlayer === "B" ? "opacity-100" : "opacity-0"
        }`}
      />

      <audio ref={audioRef} src={MUSIC_SRC} loop preload="auto" className="hidden" />

      <div className={`absolute inset-0 transition-all duration-2000 ${
        showText
          ? "bg-gradient-to-b from-black/40 via-black/30 to-black/70"
          : "bg-gradient-to-b from-black/40 via-black/20 to-black/60"
      }`} />

      <button
        onClick={toggleSound}
        className="nav-text absolute bottom-6 left-6 z-20 inline-flex cursor-pointer items-center gap-2 border border-white/40 px-4 py-2.5 text-white/80 transition-all duration-400 hover:bg-white hover:text-black"
        aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
      >
        {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
        {soundOn ? "Sound Off" : "Sound On"}
      </button>

      <div
        className={`relative z-10 flex h-full flex-col items-center justify-end pb-16 text-center text-white transition-opacity duration-2000 ${
          showText ? "opacity-100" : "pointer-events-none opacity-0"
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
