"use client";

import { useState } from "react";
import { ExternalLink, FileText, Play, X } from "lucide-react";
import type { PressItem } from "@/lib/supabase/types";

interface PressCardProps {
  item: PressItem;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/
  );
  return match?.[1] ?? null;
}

export function PressCard({ item }: PressCardProps) {
  const [showModal, setShowModal] = useState(false);

  const hasMedia = item.pdf_url || item.video_url;
  const youtubeId = item.video_url ? getYouTubeId(item.video_url) : null;

  return (
    <>
      <div
        className={`group overflow-hidden border border-border${hasMedia ? " cursor-pointer" : ""}`}
        onClick={() => hasMedia && setShowModal(true)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {item.thumbnail_url ? (
            <div
              className="h-full w-full bg-cover bg-center grayscale transition-all duration-600 group-hover:grayscale-0"
              style={{ backgroundImage: `url(${item.thumbnail_url})` }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-2xl font-light text-muted-foreground">
                {item.source}
              </span>
            </div>
          )}

          {/* Media type indicator */}
          {hasMedia && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-400 group-hover:bg-black/30">
              <div className="scale-0 rounded-full bg-white/90 p-3 text-black transition-transform duration-400 group-hover:scale-100">
                {youtubeId ? <Play size={20} /> : <FileText size={20} />}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="nav-text text-xs text-muted-foreground">{item.source}</p>
          <h3 className="mt-1 font-serif text-lg font-light">{item.title}</h3>
          {item.quote && (
            <blockquote className="mt-2 border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-12 right-0 cursor-pointer text-white/70 transition-colors hover:text-white"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* YouTube embed */}
            {youtubeId ? (
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title={item.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : item.pdf_url ? (
              /* PDF embed */
              <div className="flex flex-col gap-4">
                <div className="aspect-[3/4] max-h-[80vh] w-full overflow-hidden bg-white">
                  <iframe
                    src={item.pdf_url}
                    title={item.title}
                    className="h-full w-full"
                  />
                </div>
                <a
                  href={item.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-text inline-flex items-center gap-2 self-center text-white/70 transition-colors hover:text-white"
                >
                  <ExternalLink size={14} />
                  Open in new tab
                </a>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
